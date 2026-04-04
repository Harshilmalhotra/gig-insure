import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post('simulation/environment')
  async updateEnvironment(@Body() data: { rain: number; temperature: number; aqi: number; demandLevel: string; platformStatus: string }) {
    return this.prisma.environmentState.create({
      data: {
        ...data,
        isSimulated: true,
      },
    });
  }

  @Post('simulation/worker/:id')
  async updateWorkerSimulation(@Param('id') id: string, @Body() data: { forcedOrdersPerHour: number | null; forcedMotion: string | null; forcedGpsPattern: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        forcedOrdersPerHour: data.forcedOrdersPerHour,
        forcedMotion: data.forcedMotion,
        forcedGpsPattern: data.forcedGpsPattern,
      },
    });
  }

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        policies: { where: { status: 'ACTIVE' } },
        workerStates: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
  }

  @Get('metrics')
  async getMetrics() {
    const totalUsers = await this.prisma.user.count();
    const activePolicies = await this.prisma.policy.count({ where: { status: 'ACTIVE' } });
    
    const claims = await this.prisma.claim.findMany();
    const totalPayouts = claims.filter(c => c.status === 'PAID').reduce((acc, c) => acc + c.payoutAmount, 0);
    const totalPremiumsResult = await this.prisma.policy.aggregate({
      _sum: { premium: true },
    });
    
    const totalClaims = claims.length;
    const fraudClaims = claims.filter(c => c.fraudScore > 0.7).length;

    // Generate some "live-ish" historical data based on real claims
    const dailyData = [
      { n: 'Mon', p: 400, pay: claims.filter(c => new Date(c.createdAt).getDay() === 1).reduce((a,c) => a + c.payoutAmount, 0) || 120 },
      { n: 'Tue', p: 700, pay: claims.filter(c => new Date(c.createdAt).getDay() === 2).reduce((a,c) => a + c.payoutAmount, 0) || 300 },
      { n: 'Wed', p: 500, pay: claims.filter(c => new Date(c.createdAt).getDay() === 3).reduce((a,c) => a + c.payoutAmount, 0) || 450 },
      { n: 'Thu', p: 900, pay: claims.filter(c => new Date(c.createdAt).getDay() === 4).reduce((a,c) => a + c.payoutAmount, 0) || 200 },
      { n: 'Fri', p: 1200, pay: claims.filter(c => new Date(c.createdAt).getDay() === 5).reduce((a,c) => a + c.payoutAmount, 0) || 800 },
    ];

    return {
      totalUsers,
      activePolicies,
      totalClaims,
      fraudClaims,
      fraudRate: totalClaims > 0 ? (fraudClaims / totalClaims) : 0,
      totalPayouts: totalPayouts || 0,
      totalPremiums: totalPremiumsResult._sum.premium || 0,
      lossRatio: totalPayouts / (totalPremiumsResult._sum.premium || 1),
      dailyData
    };
  }

  @Get('claims')
  async getClaims() {
    return this.prisma.claim.findMany({
      include: { user: true, policy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('fraud/stats')
  async getFraudStats() {
    const claims = await this.prisma.claim.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const recentFlagged = claims.filter(c => c.fraudScore > 0.6).slice(0, 10);
    
    const distribution = {
      lowRisk: claims.filter(c => c.fraudScore <= 0.3).length,
      mediumRisk: claims.filter(c => c.fraudScore > 0.3 && c.fraudScore <= 0.7).length,
      highRisk: claims.filter(c => c.fraudScore > 0.7).length,
    };

    // Generate real hourly stats for the last 5 hours
    const hourlyStats = [4, 3, 2, 1, 0].map(h => {
      const date = new Date(Date.now() - h * 3600000);
      const hour = date.getHours();
      const count = claims.filter(c => {
         const cd = new Date(c.createdAt);
         return cd.getHours() === hour && c.fraudScore > 0.6;
      }).length;
      return { n: `${hour}:00`, v: count || Math.floor(Math.random() * 5) }; // Fallback to small random for demo feel if empty
    });

    return {
      distribution,
      recentFlagged,
      hourlyStats
    };
  }

  @Get('risk/zones')
  async getRiskZones() {
    // Dynamically generate zones from active worker states
    const states = await this.prisma.workerState.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: { user: true }
    });

    // Bucket states into zones based on lat/lon
    const zones = [
        { id: 'mumbai', name: 'Mumbai West', latRange: [18, 20], lonRange: [71, 74] },
        { id: 'chennai', name: 'Chennai South', latRange: [12, 14], lonRange: [79, 81] },
        { id: 'pune', name: 'Pune Central', latRange: [18, 19], lonRange: [73, 74] },
    ];

    const results = zones.map(z => {
        const zoneStates = states.filter(s => 
            s.lat !== null && s.lat >= z.latRange[0] && s.lat <= z.latRange[1] &&
            s.lon !== null && s.lon >= z.lonRange[0] && s.lon <= z.lonRange[1]
        );
        
        const avgRain = zoneStates.reduce((a, s) => a + (s.earnings > 100 ? 30 : 5), 0) / (zoneStates.length || 1); // Mock mapping via telemetry for demo depth
        const risk = avgRain > 20 ? 'HIGH' : (avgRain > 10 ? 'MEDIUM' : 'LOW');

        return {
            id: z.id,
            name: `Zone - ${z.name}`,
            risk,
            rain: Math.floor(avgRain),
            userCount: zoneStates.length
        };
    });

    return results;
  }

  @Get('policies/stats')
  async getPoliciesStats() {
    const active = await this.prisma.policy.count({ where: { status: 'ACTIVE' } });
    const expired = await this.prisma.policy.count({ where: { status: 'EXPIRED' } });
    return { active, expired, renewalRate: 0.85 }; // Mock renewal rate
  }

  @Post('simulation/scenario')
  async triggerScenario(@Body() data: { scenario: string }) {
    // Simplified scenario triggers
    let envData = { rain: 0, temperature: 30, aqi: 50, demandLevel: 'medium', platformStatus: 'online' };
    
    switch(data.scenario) {
      case 'HEAVY_RAIN':
        envData = { rain: 60, temperature: 24, aqi: 120, demandLevel: 'high', platformStatus: 'online' };
        break;
      case 'DEMAND_CRASH':
        envData = { rain: 5, temperature: 28, aqi: 60, demandLevel: 'low', platformStatus: 'online' };
        break;
      case 'FRAUD_ATTACK':
        // Trigger specific fraud behavior (handled by consumers of this state)
        envData = { rain: 5, temperature: 28, aqi: 60, demandLevel: 'medium', platformStatus: 'online' };
        // We could also flag some users for fraud here in a real scenario
        break;
      case 'PLATFORM_OUTAGE':
        envData = { rain: 5, temperature: 28, aqi: 60, demandLevel: 'high', platformStatus: 'outage' };
        break;
    }

    return this.prisma.environmentState.create({
      data: { ...envData, isSimulated: true }
    });
  }

  @Post('simulation/worker-override')
  async overrideWorker(@Body() data: { userId: string, forcedMotion?: string, forcedGpsPattern?: string, forcedOrdersPerHour?: number }) {
    return this.prisma.user.update({
      where: { id: data.userId },
      data: {
        forcedMotion: data.forcedMotion ?? null,
        forcedGpsPattern: data.forcedGpsPattern ?? null,
        forcedOrdersPerHour: data.forcedOrdersPerHour ?? null
      }
    });
  }

  @Post('simulation/fraud-injection')
  async injectFraud(@Body() data: { targetZone: string, magnitude: number }) {
    // In a real demo, we could find users in a zone and flag them
    const states = await this.prisma.workerState.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' }
    });
    
    // Simulate by flagging some recent states as anomalies for the chart
    for (const state of states) {
        if (Math.random() < (data.magnitude / 100)) {
            await this.prisma.claim.create({
                data: {
                    userId: state.userId,
                    policyId: (await this.prisma.policy.findFirst({ where: { userId: state.userId } }))?.id || 'demo-policy',
                    triggerType: 'FRAUD_PROBE',
                    payoutAmount: 0,
                    activityScore: 0.1,
                    fraudScore: 0.95,
                    status: 'REJECTED'
                }
            });
        }
    }
    return { success: true, magnitude: data.magnitude };
  }

  @Post('simulation/reset')
  async resetSimulation() {
    // 1. Reset Environment
    await this.prisma.environmentState.create({
      data: {
        rain: 0,
        temperature: 28,
        aqi: 45,
        demandLevel: 'high',
        platformStatus: 'online',
        isSimulated: false
      }
    });

    // 2. Clear all worker overrides
    await this.prisma.user.updateMany({
      data: {
        forcedMotion: null,
        forcedGpsPattern: null,
        forcedOrdersPerHour: null
      }
    });

    return { success: true, message: 'Simulation stopped and reset to live defaults.' };
  }

  @Get('events')
  async getLiveEvents() {
    const claims = await this.prisma.claim.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
      take: 10,
    });
    
    const env = await this.prisma.environmentState.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    return {
      claims,
      currentEnvironment: env,
      timestamp: new Date(),
    };
  }
}
