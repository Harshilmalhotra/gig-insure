import { Body, Controller, Get, Param, Post, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockPlatformService } from '../mock-platform/mock-platform.service';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private mockPlatform: MockPlatformService,
  ) {}

  @Post('register')
  async register(@Body() data: { phone: string; name: string; platform: string; password?: string }) {
    console.log(`[AUTH] Register request for terminal ${data.phone}`);
    
    try {
      // 1. Fetch behavioral data from platform
      const platformData = await this.mockPlatform.fetchWorkerProfile(data.platform);
      
      // 2. Optimized Upsert for high-fidelity phone identification
      const user = await this.prisma.user.upsert({
        where: { phone: data.phone },
        update: { 
          ...platformData,
          password: data.password 
        },
        create: { 
          phone: data.phone, 
          name: data.name, 
          password: data.password,
          ...platformData 
        },
      });

      console.log(`[AUTH] Signup SUCCESS: USER_ID=${user.id}`);
      return user;
    } catch (error) {
      console.error('[AUTH] Signup FAILED:', error.message);
      // Prisma P2002 is Duplicate Unique Constraint
      if (error.code === 'P2002') {
        throw new InternalServerErrorException('This mobile number is already tied to a worker session.');
      }
      throw new InternalServerErrorException('Database link failed. Please check PostgreSQL status.');
    }
  }

  @Post('login')
  async login(@Body() data: { phone: string; password?: string }) {
    console.log(`[AUTH] Login attempt for terminal ${data.phone}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { phone: data.phone }
      });

      if (!user || user.password !== data.password) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      console.log(`[AUTH] Login SUCCESS: USER_ID=${user.id}`);
      return user;
    } catch (e) {
      throw new UnauthorizedException('Authentication rejected.');
    }
  }

  @Get('worker/:id')
  async getWorker(@Param('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        policies: {
          where: { status: 'ACTIVE' },
          include: { claims: true }
        }
      }
    });
  }
}
