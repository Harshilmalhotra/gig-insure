import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('insurance')
export class InsuranceController {
  constructor(
    private insurance: InsuranceService,
    private prisma: PrismaService,
  ) {}

  @Get('quote/:userId')
  async getQuote(
    @Param('userId') userId: string,
    @Query('lat') lat?: number,
    @Query('lon') lon?: number
  ) {
    return this.insurance.quotePremium(userId, lat ? Number(lat) : undefined, lon ? Number(lon) : undefined);
  }

  @Post('policy/purchase')
  async purchasePolicy(@Body() data: { userId: string; premium: number; coverage: number }) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7-day policy

    return this.prisma.policy.create({
      data: {
        userId: data.userId,
        premium: data.premium,
        coverage: data.coverage,
        endDate: endDate,
        status: 'ACTIVE',
      },
    });
  }

  @Get('policy/active/:userId')
  async getActivePolicy(@Param('userId') userId: string) {
    return this.prisma.policy.findFirst({
      where: { userId, status: 'ACTIVE', endDate: { gt: new Date() } },
      include: { claims: true },
    });
  }

  @Post('worker/heartbeat')
  async heartbeat(@Body() data: { 
    userId: string; 
    ordersPerHour: number; 
    motion: string; 
    gpsPattern: string; 
    earnings: number;
    lat?: number;
    lon?: number;
  }) {
    return this.insurance.processWorkerHeartbeat(data.userId, data);
  }

  @Post('claims/:id/evidence')
  async submitProof(@Param('id') id: string, @Body() data: { evidenceUrl: string }) {
    console.log(`[WORKER] Evidence submitted for claim ${id}`);
    return this.prisma.claim.update({
      where: { id },
      data: {
        evidenceUrl: data.evidenceUrl,
        status: 'PENDING_REVIEW'
      }
    });
  }
}
