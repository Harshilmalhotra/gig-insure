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
      
      // 3. SEED INITIAL EXPERIENCE (HACKATHON WINNER FEATURE)
      // Create a dummy policy and 2-3 sample claims so the app isn't empty
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 5);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);

      const policy = await this.prisma.policy.create({
        data: {
          userId: user.id,
          coverage: 5000,
          premium: 84,
          startDate,
          endDate,
          status: 'ACTIVE'
        }
      });

      await this.prisma.claim.createMany({
        data: [
          {
            userId: user.id,
            policyId: policy.id,
            triggerType: 'RAIN',
            payoutAmount: 420.0,
            activityScore: 0.84,
            fraudScore: 0.10,
            status: 'PAID',
            createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
          },
          {
            userId: user.id,
            policyId: policy.id,
            triggerType: 'DEMAND_CRASH',
            payoutAmount: 310.0,
            activityScore: 0.78,
            fraudScore: 0.05,
            status: 'PAID',
            createdAt: new Date(Date.now() - 86400000 * 4) // 4 days ago
          }
        ]
      });

      const fullUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { policies: { orderBy: { startDate: 'desc' } }, claims: { orderBy: { createdAt: 'desc' } } }
      });
      console.log(`[AUTH] Signup SUCCESS: USER_ID=${user.id}`);
      return fullUser;
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

      // Include relationships for immediate UI population
      const fullUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { policies: { orderBy: { startDate: 'desc' } }, claims: { orderBy: { createdAt: 'desc' } } }
      });
      console.log(`[AUTH] Login SUCCESS: USER_ID=${user.id}`);
      return fullUser;
    } catch (e) {
      throw new UnauthorizedException('Authentication rejected.');
    }
  }

  @Get('worker/:id')
  async getWorker(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        policies: {
          orderBy: { startDate: 'desc' }
        }, 
        claims: {
          orderBy: { createdAt: 'desc' }
        }
      },
    }) as any;

    // AUTO-SEED FOR DEMO 'test 3' (phone 6543)
    if (user && user.phone === '6543' && user.claims.length === 0) {
      console.log(`[AUTH] Seeding claims for 'test 3' demo user...`);
      const poly = user.policies[0] || await this.prisma.policy.create({
        data: {
          userId: user.id,
          coverage: 5000,
          premium: 43,
          startDate: new Date(Date.now() - 86400000 * 5),
          endDate: new Date(Date.now() + 86400000 * 2),
        }
      });

      await this.prisma.claim.createMany({
        data: [
          { userId: user.id, policyId: poly.id, triggerType: 'RAIN', payoutAmount: 420.0, activityScore: 0.82, fraudScore: 0.12, status: 'PAID', createdAt: new Date(Date.now() - 86400000) },
          { userId: user.id, policyId: poly.id, triggerType: 'DEMAND_CRASH', payoutAmount: 310.0, activityScore: 0.78, fraudScore: 0.05, status: 'PAID', createdAt: new Date(Date.now() - 86400000 * 3) }
        ]
      });
      return await this.prisma.user.findUnique({ where: { id }, include: { policies: { orderBy: { startDate: 'desc' } }, claims: { orderBy: { createdAt: 'desc' } } } });
    }

    return user;
  }
}
