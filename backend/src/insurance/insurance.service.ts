import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class InsuranceService {
  constructor(
    private prisma: PrismaService,
    private weather: WeatherService,
  ) {}

  private readonly trustGraphRadiusKm = 0.2;

  private clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }

  private sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
  }

  private avg(values: number[]) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private stddev(values: number[], mean?: number) {
    if (values.length <= 1) return 0;
    const m = mean ?? this.avg(values);
    const variance = values.reduce((sum, value) => sum + ((value - m) ** 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private zScore(value: number, mean: number, std: number) {
    if (std <= 1e-6) return 0;
    return (value - mean) / std;
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadius = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  private decisionBand(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= 0.7) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private demandToNumeric(level?: string) {
    if (level === 'high') return 1;
    if (level === 'medium') return 0.5;
    return 0;
  }

  private buildDecisionSummary(params: {
    trigger: string;
    band: 'LOW' | 'MEDIUM' | 'HIGH';
    language?: string;
    anomalyScore: number;
    speedZ: number;
    gpsVarianceZ: number;
    trustGraph: { ringDetected: boolean; nearbyDistinctUsers: number; suspiciousClusterCount: number };
    weather: { rain: number; temp: number; platformStatus: string };
  }) {
    const {
      trigger,
      band,
      language = 'en',
      anomalyScore,
      speedZ,
      gpsVarianceZ,
      trustGraph,
      weather,
    } = params;
    const isHindi = language.toLowerCase() === 'hi';

    const triggerLabel = trigger.replace('_', ' ').toLowerCase();
    const weatherContext = `rain ${weather.rain.toFixed(1)}mm, temp ${weather.temp.toFixed(1)}C, platform ${weather.platformStatus}`;
    const trustContext = trustGraph.ringDetected
      ? `cluster flagged with ${trustGraph.nearbyDistinctUsers} nearby users and ${trustGraph.suspiciousClusterCount} suspicious claims`
      : `no coordinated cluster detected`;

    if (isHindi) {
      const level = band === 'LOW' ? 'निम्न जोखिम' : band === 'MEDIUM' ? 'मध्यम जोखिम' : 'उच्च जोखिम';
      const action = band === 'LOW'
        ? 'क्लेम ऑटो-सेटल किया गया।'
        : band === 'MEDIUM'
          ? 'त्वरित सत्यापन के लिए प्रमाण आवश्यक है।'
          : 'मैनुअल समीक्षा आवश्यक है।';

      return `${level}: ${triggerLabel} ट्रिगर मान्य है, anomaly score ${anomalyScore.toFixed(2)} (speed z ${speedZ.toFixed(2)}, gps variance z ${gpsVarianceZ.toFixed(2)}), ${trustGraph.ringDetected ? 'डिवाइस क्लस्टर संकेत मिला' : 'कोई क्लस्टर जोखिम नहीं'}, ${action}`;
    }

    const level = band === 'LOW' ? 'Low Risk' : band === 'MEDIUM' ? 'Medium Risk' : 'High Risk';
    const action = band === 'LOW'
      ? 'Auto-settlement approved.'
      : band === 'MEDIUM'
        ? 'Quick evidence is required for review.'
        : 'Human review required.';

    return `${level}: ${triggerLabel} trigger validated (${weatherContext}), anomaly score ${anomalyScore.toFixed(2)} (speed z ${speedZ.toFixed(2)}, gps variance z ${gpsVarianceZ.toFixed(2)}), ${trustContext}. ${action}`;
  }

  private async computeModelRiskProxy(userId: string, telemetry: { ordersPerHour: number; motion: string; gpsPattern: string }) {
    const recentStates = await this.prisma.workerState.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    const anomalyCount = recentStates.filter((state) => state.gpsPattern === 'anomaly').length;
    const anomalyRate = recentStates.length > 0 ? anomalyCount / recentStates.length : 0;

    const recentOrders = recentStates.map((state) => state.ordersPerHour);
    const avgOrders = recentOrders.length > 0
      ? recentOrders.reduce((sum, value) => sum + value, 0) / recentOrders.length
      : telemetry.ordersPerHour;
    const demandDropSignal = avgOrders <= 0 ? 0 : this.clamp((avgOrders - telemetry.ordersPerHour) / Math.max(avgOrders, 1));

    const motionSignal = telemetry.motion === 'moving' ? 0.1 : 0.7;
    const gpsSignal = telemetry.gpsPattern === 'anomaly' ? 0.8 : 0.1;

    // AI-ready proxy score: engineered features now, can be replaced by onnxruntime-node later.
    const modelRiskScore = this.clamp((0.45 * gpsSignal) + (0.25 * motionSignal) + (0.2 * anomalyRate) + (0.1 * demandDropSignal));

    return {
      modelRiskScore,
      featureBreakdown: {
        gpsSignal,
        motionSignal,
        anomalyRate,
        demandDropSignal,
      },
    };
  }

  private async computePredictiveRiskProbability(userId: string, lat?: number, lon?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const weatherData = await this.weather.getCurrentWeather(lat, lon);
    const recentEnvStates = await this.prisma.environmentState.findMany({
      orderBy: { timestamp: 'desc' },
      take: 48,
    });
    const recentWorkerStates = await this.prisma.workerState.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 48,
    });
    const recentClaims = await this.prisma.claim.findMany({
      where: {
        userId,
        createdAt: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21) },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const weatherSeverity = this.clamp(
      Math.max(
        weatherData.rain / 40,
        weatherData.temp > 35 ? (weatherData.temp - 35) / 12 : 0,
        weatherData.platformStatus === 'outage' ? 1 : 0,
      ),
    );

    const demandSeries = recentEnvStates.map((state) => this.demandToNumeric(state.demandLevel));
    const demandMean = this.avg(demandSeries);
    const demandVolatility = this.clamp(this.stddev(demandSeries, demandMean) / 0.5);

    const disruptionClaimCount = recentClaims.filter((claim) =>
      ['RAIN', 'HEAT', 'DEMAND_CRASH', 'PLATFORM_OUTAGE', 'OUTAGE'].includes(claim.triggerType),
    ).length;
    const disruptionRate = this.clamp(disruptionClaimCount / Math.max(recentClaims.length, 1));

    const orderSeries = recentWorkerStates.map((state) => state.ordersPerHour);
    const orderMean = this.avg(orderSeries);
    const orderVariance = this.stddev(orderSeries, orderMean);
    const behaviorVariance = this.clamp(orderVariance / Math.max(orderMean, 1));

    const consistencyPenalty = this.clamp(1 - (user.consistencyScore || 0.8));

    // Lightweight statistical surrogate for a model probability output (XGBoost-like continuous output).
    const linearLogit =
      (-1.2) +
      (1.7 * weatherSeverity) +
      (1.1 * demandVolatility) +
      (0.9 * disruptionRate) +
      (0.8 * behaviorVariance) +
      (0.6 * consistencyPenalty);
    const riskProbability = this.clamp(this.sigmoid(linearLogit));

    return {
      riskProbability,
      features: {
        weatherSeverity,
        demandVolatility,
        disruptionRate,
        behaviorVariance,
        consistencyPenalty,
      },
      weatherData,
      user,
    };
  }

  private async computeAnomalyScore(userId: string, telemetry: {
    motion: string;
    gpsPattern: string;
    lat?: number;
    lon?: number;
  }) {
    const recentStates = await this.prisma.workerState.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 25,
    });

    const speedSeries: number[] = [];
    for (let i = 1; i < recentStates.length; i++) {
      const current = recentStates[i - 1];
      const previous = recentStates[i];
      if (current.lat == null || current.lon == null || previous.lat == null || previous.lon == null) continue;
      const distanceKm = this.haversineKm(previous.lat, previous.lon, current.lat, current.lon);
      const deltaHours = Math.max((new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()) / (1000 * 60 * 60), 1 / 3600);
      speedSeries.push(distanceKm / deltaHours);
    }

    const historicalMeanSpeed = this.avg(speedSeries);
    const historicalStdSpeed = this.stddev(speedSeries, historicalMeanSpeed);

    let currentSpeed = 0;
    const latest = recentStates[0];
    if (
      latest &&
      latest.lat != null &&
      latest.lon != null &&
      telemetry.lat != null &&
      telemetry.lon != null
    ) {
      const distanceKm = this.haversineKm(latest.lat, latest.lon, telemetry.lat, telemetry.lon);
      const deltaHours = Math.max((Date.now() - new Date(latest.timestamp).getTime()) / (1000 * 60 * 60), 1 / 3600);
      currentSpeed = distanceKm / deltaHours;
    }

    const points = recentStates
      .filter((state) => state.lat != null && state.lon != null)
      .map((state) => ({ lat: state.lat as number, lon: state.lon as number }));
    if (telemetry.lat != null && telemetry.lon != null) {
      points.push({ lat: telemetry.lat, lon: telemetry.lon });
    }

    let currentGpsVariance = 0;
    if (points.length > 1) {
      const centerLat = this.avg(points.map((point) => point.lat));
      const centerLon = this.avg(points.map((point) => point.lon));
      const distances = points.map((point) => this.haversineKm(centerLat, centerLon, point.lat, point.lon));
      currentGpsVariance = this.stddev(distances, this.avg(distances));
    }

    const historicalGpsVarSeries: number[] = [];
    for (let i = 0; i + 4 < recentStates.length; i++) {
      const window = recentStates.slice(i, i + 5)
        .filter((state) => state.lat != null && state.lon != null)
        .map((state) => ({ lat: state.lat as number, lon: state.lon as number }));
      if (window.length < 2) continue;
      const centerLat = this.avg(window.map((point) => point.lat));
      const centerLon = this.avg(window.map((point) => point.lon));
      const distances = window.map((point) => this.haversineKm(centerLat, centerLon, point.lat, point.lon));
      historicalGpsVarSeries.push(this.stddev(distances, this.avg(distances)));
    }

    const historicalMeanGpsVar = this.avg(historicalGpsVarSeries);
    const historicalStdGpsVar = this.stddev(historicalGpsVarSeries, historicalMeanGpsVar);

    const speedZ = this.zScore(currentSpeed, historicalMeanSpeed, historicalStdSpeed || 12);
    const gpsVarianceZ = this.zScore(currentGpsVariance, historicalMeanGpsVar, historicalStdGpsVar || 0.05);
    const motionMismatch = telemetry.motion === 'moving' ? 0 : (currentSpeed > 15 ? 0.8 : 0.2);
    const gpsPatternPenalty = telemetry.gpsPattern === 'anomaly' ? 0.7 : 0.1;

    const anomalyScore = this.clamp(
      (0.35 * this.clamp(Math.abs(speedZ) / 3)) +
      (0.35 * this.clamp(Math.abs(gpsVarianceZ) / 3)) +
      (0.2 * motionMismatch) +
      (0.1 * gpsPatternPenalty),
    );

    return {
      anomalyScore,
      speedZ,
      gpsVarianceZ,
      currentSpeed,
      currentGpsVariance,
    };
  }

  private async runTrustGraphCheck(userId: string, lat?: number, lon?: number) {
    if (lat == null || lon == null) {
      return {
        ringDetected: false,
        nearbyDistinctUsers: 0,
        suspiciousClusterCount: 0,
      };
    }

    const fiveMinutesAgo = new Date(Date.now() - 1000 * 60 * 5);
    const deltaLat = this.trustGraphRadiusKm / 111;
    const deltaLon = this.trustGraphRadiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.2));

    const nearbyStates = await this.prisma.workerState.findMany({
      where: {
        timestamp: { gt: fiveMinutesAgo },
        lat: { gte: lat - deltaLat, lte: lat + deltaLat },
        lon: { gte: lon - deltaLon, lte: lon + deltaLon },
      },
      select: {
        userId: true,
        lat: true,
        lon: true,
      },
    });

    const nearbyUserIds = new Set<string>();
    for (const state of nearbyStates) {
      if (state.userId === userId || state.lat == null || state.lon == null) continue;
      const distance = this.haversineKm(lat, lon, state.lat, state.lon);
      if (distance <= this.trustGraphRadiusKm) {
        nearbyUserIds.add(state.userId);
      }
    }

    const candidateUserIds = Array.from(nearbyUserIds);
    let suspiciousClusterCount = 0;
    if (candidateUserIds.length > 0) {
      suspiciousClusterCount = await this.prisma.claim.count({
        where: {
          userId: { in: candidateUserIds },
          createdAt: { gt: fiveMinutesAgo },
          OR: [
            { status: 'FLAGGED' },
            { fraudScore: { gt: 0.65 } },
          ],
        },
      });
    }

    const ringDetected = candidateUserIds.length >= 3 || suspiciousClusterCount >= 2;
    return {
      ringDetected,
      nearbyDistinctUsers: candidateUserIds.length,
      suspiciousClusterCount,
    };
  }

  private buildClaimExplanationFromStoredScores(
    claim: { triggerType: string; fraudScore: number; activityScore: number },
    band: 'LOW' | 'MEDIUM' | 'HIGH',
    language = 'en',
  ) {
    const isHindi = language.toLowerCase() === 'hi';
    const triggerLabel = claim.triggerType.replace('_', ' ').toLowerCase();

    if (isHindi) {
      const level = band === 'LOW' ? 'निम्न जोखिम' : band === 'MEDIUM' ? 'मध्यम जोखिम' : 'उच्च जोखिम';
      return `${level}: ${triggerLabel} ट्रिगर मिला। fraud score ${claim.fraudScore.toFixed(2)} और activity score ${claim.activityScore.toFixed(2)} के आधार पर निर्णय लिया गया।`;
    }

    const level = band === 'LOW' ? 'Low Risk' : band === 'MEDIUM' ? 'Medium Risk' : 'High Risk';
    return `${level}: ${triggerLabel} trigger detected. Decision synthesized from fraud score ${claim.fraudScore.toFixed(2)} and activity score ${claim.activityScore.toFixed(2)}.`;
  }

  /**
   * STEP 2: RISK PROFILING
   * Combine multi-source inputs: Environment, Behavior, and Zone.
   */
  async calculateRisk(userId: string, lat?: number, lon?: number) {
    const predicted = await this.computePredictiveRiskProbability(userId, lat, lon);
    return {
      riskScore: predicted.riskProbability,
      weatherRisk: predicted.features.weatherSeverity,
      zoneDisruption: predicted.features.disruptionRate,
      behaviorVariance: predicted.features.behaviorVariance,
      predictiveFeatures: predicted.features,
    };
  }

  /**
   * STEP 3: PREMIUM CALCULATION
   * premium = base (₹20) + (riskScore × earningsFactor) - trustDiscount
   */
  async quotePremium(userId: string, lat?: number, lon?: number) {
    const { riskScore, predictiveFeatures } = await this.calculateRisk(userId, lat, lon);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User profile record required for premium calculation.');
    }
    
    const basePremium = 25;
    const weeklyIncomeProxy = Math.max((user.baseEarnings || user.avgDailyEarnings || 1000) * 7, 3500);
    const exposureFactor = this.clamp(weeklyIncomeProxy / 12000, 0.4, 2.2);
    const trustModifier = this.clamp(1 - ((user.consistencyScore || 0.8) * 0.35), 0.6, 1.15);

    // Premium curve based on continuous disruption probability.
    const modelComponent = (40 * riskScore * exposureFactor * trustModifier);
    const uncertaintyLoading = 8 * (predictiveFeatures?.demandVolatility ?? 0);
    const totalPremium = basePremium + modelComponent + uncertaintyLoading;

    return {
      userId,
      riskScore,
      totalPremium: Math.max(Math.ceil(totalPremium), 15), // Floor of ₹15
      currency: 'INR',
      model: {
        type: 'PREDICTIVE_RISK_PROXY',
        probabilityOfDisruption: riskScore,
      },
    };
  }

  getClaimDecisionSummary(
    claim: { triggerType: string; fraudScore: number; activityScore: number },
    language: 'en' | 'hi' = 'en',
  ) {
    const band = this.decisionBand(claim.fraudScore);
    return {
      band,
      explanation: this.buildClaimExplanationFromStoredScores(claim, band, language),
    };
  }

  /**
   * STEP 4: POLICY PURCHASE
   * Managed via InsuranceController and Prisma
   */
  async processWorkerHeartbeat(userId: string, telemetry: { ordersPerHour: number; motion: string; gpsPattern: string; earnings: number; lat?: number; lon?: number; language?: string }) {
    // 1. Check for simulation overrides
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { status: 'USER_NOT_FOUND' };

    const effectiveTelemetry = {
      ordersPerHour: user.forcedOrdersPerHour !== null ? user.forcedOrdersPerHour : telemetry.ordersPerHour,
      motion: user.forcedMotion !== null ? user.forcedMotion : telemetry.motion,
      gpsPattern: user.forcedGpsPattern !== null ? user.forcedGpsPattern : telemetry.gpsPattern,
      earnings: telemetry.earnings,
      lat: telemetry.lat,
      lon: telemetry.lon
    };

    // 2. Store state
    await this.prisma.workerState.create({
      data: {
        userId,
        ordersPerHour: effectiveTelemetry.ordersPerHour ?? 0,
        motion: effectiveTelemetry.motion ?? 'idle',
        gpsPattern: effectiveTelemetry.gpsPattern ?? 'smooth',
        earnings: effectiveTelemetry.earnings ?? 0,
        lat: effectiveTelemetry.lat,
        lon: effectiveTelemetry.lon
      },
    });

    // 3. Heartbeat Response with Claims Check
    const activePolicy = await this.prisma.policy.findFirst({
      where: { userId, status: 'ACTIVE', endDate: { gt: new Date() } },
    });

    if (activePolicy) {
      const weatherData = await this.weather.getCurrentWeather(effectiveTelemetry.lat, effectiveTelemetry.lon);
      const envState = await this.prisma.environmentState.findFirst({ orderBy: { timestamp: 'desc' } });
      
      let trigger: string | null = null;

      // 1. Environmental Triggers
      if (weatherData.rain > 5) trigger = 'RAIN'; 
      else if (weatherData.temp > 43) trigger = 'HEAT';
      else if (weatherData.platformStatus === 'outage') trigger = 'PLATFORM_OUTAGE';
      
      // 2. Behavioral/Market Trigger (Demand Crash)
      if (!trigger && envState?.demandLevel === 'low' && effectiveTelemetry.ordersPerHour < 1) {
        trigger = 'DEMAND_CRASH';
      }

      const weather = {
        temp: weatherData.temp,
        rain: weatherData.rain,
        platformStatus: weatherData.platformStatus,
        isSimulated: weatherData.isSimulated
      };

      const isOverridden = user.forcedOrdersPerHour !== null || user.forcedMotion !== null || user.forcedGpsPattern !== null;

      if (trigger) {
        const recentClaim = await this.prisma.claim.findFirst({
          where: { userId, policyId: activePolicy.id, triggerType: trigger, createdAt: { gt: new Date(Date.now() - 60000) } }, // 1min cooldown for demo
        });

        if (!recentClaim) {
          const activityScore = effectiveTelemetry.motion === 'moving' ? 1.0 : 0.4;
          const ruleFraudScore = effectiveTelemetry.gpsPattern === 'anomaly' ? 0.8 : 0.15;
          const { modelRiskScore, featureBreakdown } = await this.computeModelRiskProxy(userId, effectiveTelemetry);
          const anomaly = await this.computeAnomalyScore(userId, effectiveTelemetry);
          const trustGraph = await this.runTrustGraphCheck(userId, effectiveTelemetry.lat, effectiveTelemetry.lon);

          const fraudScore = this.clamp(
            (0.25 * ruleFraudScore) +
            (0.25 * modelRiskScore) +
            (0.35 * anomaly.anomalyScore) +
            (0.15 * (trustGraph.ringDetected ? 1 : this.clamp(trustGraph.nearbyDistinctUsers / 5))),
          );
          const band = this.decisionBand(fraudScore);

          const payout = activePolicy.coverage * activityScore * (1 - fraudScore);
          const status = band === 'LOW' ? 'PAID' : (band === 'MEDIUM' ? 'PENDING_REVIEW' : 'FLAGGED');
          const needsProof = band !== 'LOW';

          const reasonCodes: string[] = [];
          if (ruleFraudScore > 0.6) reasonCodes.push('GPS_ANOMALY');
          if (featureBreakdown.motionSignal > 0.6) reasonCodes.push('LOW_MOTION_CONFIDENCE');
          if (featureBreakdown.anomalyRate > 0.4) reasonCodes.push('HISTORICAL_GPS_INSTABILITY');
          if (featureBreakdown.demandDropSignal > 0.4) reasonCodes.push('SUDDEN_OUTPUT_DROP');
          if (Math.abs(anomaly.speedZ) > 2) reasonCodes.push('SPEED_OUTLIER_ZSCORE');
          if (Math.abs(anomaly.gpsVarianceZ) > 2) reasonCodes.push('GPS_VARIANCE_OUTLIER_ZSCORE');
          if (trustGraph.ringDetected) reasonCodes.push('TRUST_GRAPH_CLUSTER_FLAG');
          if (reasonCodes.length === 0) reasonCodes.push('CONSISTENT_ACTIVITY');

          const dynamicMessage = this.buildDecisionSummary({
            trigger,
            band,
            language: telemetry.language || 'en',
            anomalyScore: anomaly.anomalyScore,
            speedZ: anomaly.speedZ,
            gpsVarianceZ: anomaly.gpsVarianceZ,
            trustGraph,
            weather,
          });

          await this.prisma.claim.create({
            data: {
              userId,
              policyId: activePolicy.id,
              triggerType: trigger,
              payoutAmount: payout,
              activityScore,
              fraudScore,
              adminNotes: JSON.stringify({
                aiDecisionMeta: {
                  anomalyScore: anomaly.anomalyScore,
                  speedZScore: anomaly.speedZ,
                  gpsVarianceZScore: anomaly.gpsVarianceZ,
                  trustGraph,
                  dynamicMessage,
                  reasonCodes,
                },
              }),
              status,
            },
          });
          
          return { 
            activeTrigger: trigger, 
            payoutProcessed: band === 'LOW',
            isFlagged: band === 'HIGH',
            payoutAmount: Math.round(payout),
            decision: {
              mode: 'HYBRID_RULES_RISK',
              band,
              status,
              explanation: {
                reasonCodes,
                ruleFraudScore,
                modelRiskScore,
                anomalyScore: anomaly.anomalyScore,
                speedZScore: anomaly.speedZ,
                gpsVarianceZScore: anomaly.gpsVarianceZ,
                trustGraph,
                language: telemetry.language || 'en',
                message: dynamicMessage,
              },
              recommendation: needsProof ? 'REQUEST_EVIDENCE' : 'AUTO_SETTLE',
            },
            weather,
            isOverridden,
            disruptionDetails: {
              event: trigger,
              zoneImpact: trigger === 'RAIN' ? '-65%' : '-40%',
              estimatedLoss: Math.round(payout * 1.5),
              requiresProof: needsProof,
              reason: needsProof
                ? 'Integrity anomaly detected. Video proof required for payout.' 
                : (trigger === 'RAIN' ? 'Heavy precipitation detected in zone.' : 'Reduced demand / System latency.')
            }
          };
        }
      }
      
      // If trigger active but on cooldown, still return disruption details for UI
      if (trigger) {
        return { 
            activeTrigger: trigger,
            weather,
            isOverridden,
            disruptionDetails: {
              event: trigger,
              zoneImpact: trigger === 'RAIN' ? '-65%' : '-40%',
              estimatedLoss: 400,
              reason: 'Environmental sensors reporting active disruption.'
            }
        };
      }
      return { status: 'OK', weather, isOverridden };
    }
    return { status: 'OK' };
  }
}
