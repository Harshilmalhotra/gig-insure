import { Controller, Post, Body } from '@nestjs/common';
import { MockPlatformService } from './mock-platform.service';

@Controller('mock')
export class MockController {
  constructor(private readonly mockPlatform: MockPlatformService) {}

  @Post('fetch-platform-data')
  async fetchPlatformData(@Body() data: { platform: string }) {
    // Artificial delay to simulate realistic platform API latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const profile = await this.mockPlatform.fetchWorkerProfile(data.platform);
    
    return {
      avgDailyEarnings: profile.avgDailyEarnings,
      ordersPerHour: profile.ordersPerHour,
      rating: profile.rating,
      consistencyScore: profile.consistencyScore
    };
  }
}
