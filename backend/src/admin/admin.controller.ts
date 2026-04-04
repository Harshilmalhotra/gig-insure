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

    return {
      totalUsers,
      activePolicies,
      totalClaims,
      fraudClaims,
      fraudRate: totalClaims > 0 ? (fraudClaims / totalClaims) : 0,
      totalPayouts: totalPayouts || 0,
      totalPremiums: totalPremiumsResult._sum.premium || 0,
      lossRatio: totalPayouts / (totalPremiumsResult._sum.premium || 1),
    };
  }

  @Get('claims')
  async getClaims() {
    return this.prisma.claim.findMany({
      include: { user: true, policy: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
