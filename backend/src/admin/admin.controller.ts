import { Body, Controller, Get, Post } from '@nestjs/common';
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

  @Get('metrics')
  async getMetrics() {
    const totalUsers = await this.prisma.user.count();
    const activePolicies = await this.prisma.policy.count({ where: { status: 'ACTIVE' } });
    const totalClaims = await this.prisma.claim.count();
    const totalPayouts = await this.prisma.claim.aggregate({
      where: { status: 'PAID' },
      _sum: { payoutAmount: true },
    });
    const totalPremiums = await this.prisma.policy.aggregate({
      _sum: { premium: true },
    });

    return {
      totalUsers,
      activePolicies,
      totalClaims,
      totalPayouts: totalPayouts._sum.payoutAmount || 0,
      totalPremiums: totalPremiums._sum.premium || 0,
      lossRatio: (totalPayouts._sum.payoutAmount || 0) / (totalPremiums._sum.premium || 1),
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
