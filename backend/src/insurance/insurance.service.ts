import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class InsuranceService {
  constructor(
    private prisma: PrismaService,
    private weather: WeatherService,
  ) {}

  async calculateRisk(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const weatherData = await this.weather.getCurrentWeather();

    // Risk factors (simplified)
    const weatherRisk = (weatherData.rain > 10 ? 0.4 : 0.1) + (weatherData.temp > 40 ? 0.3 : 0);
    const platformRisk = user.consistencyScore < 0.7 ? 0.2 : 0;

    return Math.min(weatherRisk + platformRisk, 1.0);
  }

  async quotePremium(userId: string) {
    const riskScore = await this.calculateRisk(userId);
    const basePremium = 20; // Base ₹20
    const riskPremium = riskScore * 100; // Scaled by risk

    return {
      userId,
      basePremium,
      riskScore,
      totalPremium: Math.ceil(basePremium + riskPremium),
      currency: 'INR',
    };
  }

  async processWorkerHeartbeat(userId: string, telemetry: { ordersPerHour: number; motion: string; gpsPattern: string; earnings: number }) {
    // 1. Store state
    await this.prisma.workerState.create({
      data: {
        userId,
        ...telemetry,
      },
    });

    // 2. Check for triggers
    const activePolicy = await this.prisma.policy.findFirst({
      where: { userId, status: 'ACTIVE', endDate: { gt: new Date() } },
    });

    if (activePolicy) {
      const weatherData = await this.weather.getCurrentWeather();
      let trigger: string | null = null;

      if (weatherData.rain > 30) trigger = 'RAIN';
      else if (weatherData.temp > 43) trigger = 'HEAT';
      else if (telemetry.ordersPerHour < 0.5) trigger = 'DEMAND_CRASH';

      if (trigger) {
        // Need to create a claim if not already existing for this policy/trigger session
        // Simple logic: create if recent claim doesn't exist
        const recentClaim = await this.prisma.claim.findFirst({
          where: { userId, policyId: activePolicy.id, triggerType: trigger, createdAt: { gt: new Date(Date.now() - 3600000) } },
        });

        if (!recentClaim) {
          // Calculate activity & fraud scores
          const activityScore = telemetry.motion === 'moving' ? 0.9 : 0.3;
          const fraudScore = telemetry.gpsPattern === 'anomaly' ? 1.0 : 0.1;

          await this.prisma.claim.create({
            data: {
              userId,
              policyId: activePolicy.id,
              triggerType: trigger,
              payoutAmount: activePolicy.coverage * activityScore * (1 - fraudScore),
              activityScore,
              fraudScore,
              status: 'PENDING',
            },
          });
        }
      }
    }
  }
}
