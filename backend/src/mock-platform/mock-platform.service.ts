import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPlatformService {
  async fetchWorkerProfile(platform: string) {
    // Generate a consistent but randomized profile for demo
    const baseEarnings = 800 + Math.random() * 800; // 800 - 1600
    const baseRating = 4.0 + Math.random() * 1.0; // 4.0 - 5.0
    const consistencyScore = 0.5 + Math.random() * 0.5; // 0.5 - 1.0

    return {
      platform,
      baseEarnings: Math.round(baseEarnings),
      baseRating: parseFloat(baseRating.toFixed(2)),
      consistencyScore: parseFloat(consistencyScore.toFixed(2)),
    };
  }
}
