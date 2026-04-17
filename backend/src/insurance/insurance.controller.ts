import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Controller('insurance')
export class InsuranceController {
  constructor(
    private insurance: InsuranceService,
    private prisma: PrismaService,
    private storageService: StorageService,
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
    language?: 'en' | 'hi';
  }) {
    return this.insurance.processWorkerHeartbeat(data.userId, data);
  }

  @Get('claims/:id/explanation')
  async getClaimExplanation(@Param('id') id: string, @Query('lang') lang?: 'en' | 'hi') {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        user: true,
        policy: true,
      },
    });

    if (!claim) {
      return { status: 'NOT_FOUND' };
    }

    const summary = this.insurance.getClaimDecisionSummary(
      {
        triggerType: claim.triggerType,
        fraudScore: claim.fraudScore,
        activityScore: claim.activityScore,
      },
      lang || 'en',
    );

    return {
      claimId: claim.id,
      status: claim.status,
      triggerType: claim.triggerType,
      payoutAmount: claim.payoutAmount,
      activityScore: claim.activityScore,
      fraudScore: claim.fraudScore,
      decisionBand: summary.band,
      explanation: summary.explanation,
      policyCoverage: claim.policy.coverage,
      workerName: claim.user.name,
      language: lang || 'en',
    };
  }

  @Post('claims/:id/evidence')
  @UseInterceptors(FileInterceptor('video'))
  async submitProof(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File,
    @Body() data: { evidenceUrl?: string }
  ) {
    console.log(`[WORKER] Evidence submitted for claim ${id}`);
    let url = data.evidenceUrl;
    
    // If a real file is uploaded, upload it to OCI
    if (file) {
       console.log(`Uploading ${file.size} bytes video to OCI...`);
       url = await this.storageService.uploadVideo(id, file.buffer);
    }
    
    return this.prisma.claim.update({
      where: { id },
      data: {
        evidenceUrl: url,
        status: 'PENDING_REVIEW'
      }
    });
  }
}

