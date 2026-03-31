import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockPlatformService } from '../mock-platform/mock-platform.service';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private mockPlatform: MockPlatformService,
  ) {}

  @Post('register')
  async register(@Body() data: { email: string; name: string; platform: string }) {
    const profile = await this.mockPlatform.fetchWorkerProfile(data.platform);
    
    return this.prisma.user.upsert({
      where: { email: data.email },
      update: { ...profile },
      create: { 
        email: data.email, 
        name: data.name, 
        ...profile 
      },
    });
  }
}
