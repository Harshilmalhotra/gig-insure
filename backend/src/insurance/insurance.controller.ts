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
  }) {
    return this.insurance.processWorkerHeartbeat(data.userId, data);
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

