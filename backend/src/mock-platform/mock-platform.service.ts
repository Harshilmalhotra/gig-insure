import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPlatformService {
  /**
   * Mock endpoint to fetch platform-specific driver performance data.
   * Differentiates between platforms for specialized 'Inspired' data ranges.
   */
  async fetchWorkerProfile(platform: string) {
    const isSwiggy = platform.toLowerCase() === 'swiggy';
    
    // Inspired platform-specific statistical profile
    const profiles = {
      swiggy: {
        earningRange: [1100, 1600],
        orderRange: [3.2, 4.8],
        ratingRange: [4.6, 5.0],
        consistencyRange: [0.85, 0.98]
      },
      zomato: {
        earningRange: [1000, 1450],
        orderRange: [2.8, 4.2],
        ratingRange: [4.3, 4.9],
        consistencyRange: [0.75, 0.92]
      }
    };

    const config = isSwiggy ? profiles.swiggy : profiles.zomato;

    const avgDailyEarnings = config.earningRange[0] + (Math.random() * (config.earningRange[1] - config.earningRange[0]));
    const ordersPerHour = config.orderRange[0] + (Math.random() * (config.orderRange[1] - config.orderRange[0]));
    const rating = config.ratingRange[0] + (Math.random() * (config.ratingRange[1] - config.ratingRange[0]));
    const consistencyScore = config.consistencyRange[0] + (Math.random() * (config.consistencyRange[1] - config.consistencyRange[0]));

    return {
      platform,
      avgDailyEarnings: Math.round(avgDailyEarnings),
      ordersPerHour: parseFloat(ordersPerHour.toFixed(1)),
      rating: parseFloat(rating.toFixed(2)),
      consistencyScore: parseFloat(consistencyScore.toFixed(2)),
      // For backend model compatibility
      baseEarnings: Math.round(avgDailyEarnings), 
      baseRating: parseFloat(rating.toFixed(2)),
    };
  }
}
