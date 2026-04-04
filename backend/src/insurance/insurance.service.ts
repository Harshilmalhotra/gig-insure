import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class InsuranceService {
  constructor(
    private prisma: PrismaService,
    private weather: WeatherService,
  ) {}

  /**
   * STEP 2: RISK PROFILING
   * Combine multi-source inputs: Environment, Behavior, and Zone.
   */
  async calculateRisk(userId: string, lat?: number, lon?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const weatherData = await this.weather.getCurrentWeather(lat, lon);

    // 1. weatherRisk (REAL API Data / Probability)
    const rainProbability = weatherData.rain > 0.5 ? 0.8 : 0.2; 
    const heatImpact = weatherData.temp > 42 ? 0.9 : 0.1;
    const weatherRisk = Math.max(rainProbability, heatImpact);

    // 2. zoneDisruption (SIMULATION - from Environment State)
    const zoneDisruption = weatherData.platformStatus === 'outage' ? 1.0 : 0.3;

    // 3. behaviorRisk (MOCK PLATFORM - based on Consistency Score)
    const behaviorVariance = 1.0 - (user.consistencyScore || 0.8);

    // Combine using weighted formula:
    // riskScore = 0.5 * weatherRisk + 0.3 * zoneDisruption + 0.2 * behaviorVariance
    const riskScore = (0.5 * weatherRisk) + (0.3 * zoneDisruption) + (0.2 * behaviorVariance);

    return {
      riskScore: Math.min(riskScore, 1.0),
      weatherRisk,
      zoneDisruption,
      behaviorVariance
    };
  }

  /**
   * STEP 3: PREMIUM CALCULATION
   * premium = base (₹20) + (riskScore × earningsFactor) - trustDiscount
   */
  async quotePremium(userId: string, lat?: number, lon?: number) {
    const { riskScore } = await this.calculateRisk(userId, lat, lon);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User profile record required for premium calculation.');
    }
    
    const basePremium = 20; 
    const earningsFactor = (user.baseEarnings || 1000) / 10; // Scaling factor based on daily earnings potential
    const trustDiscount = (user.baseRating ?? 0) > 4.5 ? 12 : 0; // ₹12 discount for high trust

    const totalPremium = basePremium + (riskScore * earningsFactor) - trustDiscount;

    return {
      userId,
      riskScore,
      totalPremium: Math.max(Math.ceil(totalPremium), 15), // Floor of ₹15
      currency: 'INR',
    };
  }

  /**
   * STEP 4: POLICY PURCHASE
   * Managed via InsuranceController and Prisma
   */
  async processWorkerHeartbeat(userId: string, telemetry: { ordersPerHour: number; motion: string; gpsPattern: string; earnings: number; lat?: number; lon?: number }) {
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
      if (weatherData.rain > 20) trigger = 'RAIN'; 
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
          where: { userId, policyId: activePolicy.id, triggerType: trigger, createdAt: { gt: new Date(Date.now() - 1800000) } }, // 30min cooldown
        });

        if (!recentClaim) {
          const activityScore = effectiveTelemetry.motion === 'moving' ? 1.0 : 0.4;
          const fraudScore = effectiveTelemetry.gpsPattern === 'anomaly' ? 0.9 : 0.1;

          const payout = activePolicy.coverage * activityScore * (1 - fraudScore);
          
          await this.prisma.claim.create({
            data: {
              userId,
              policyId: activePolicy.id,
              triggerType: trigger,
              payoutAmount: payout,
              activityScore,
              fraudScore,
              status: 'PAID', // Auto-pay in real-world demo
            },
          });
          return { 
            activeTrigger: trigger, 
            payoutProcessed: true, 
            payoutAmount: Math.round(payout),
            weather,
            isOverridden,
            disruptionDetails: {
              event: trigger,
              zoneImpact: trigger === 'RAIN' ? '-65%' : '-40%',
              estimatedLoss: Math.round(payout * 1.2),
              reason: trigger === 'RAIN' ? 'Heavy precipitation detected in zone.' : 'Reduced demand / System latency.'
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
