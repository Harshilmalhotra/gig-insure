import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeatherService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetches real-time weather using Open-Meteo (Free, No API Key required)
   * Fallback to simulation if global override is set in DB.
   */
  async getCurrentWeather(lat: number = 19.076, lon: number = 72.877) {
    // 1. Check for Simulation Overrides first
    const latestState = await this.prisma.environmentState.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    if (latestState && latestState.isSimulated) {
      return {
        rain: latestState.rain,
        temp: latestState.temperature,
        aqi: latestState.aqi,
        platformStatus: latestState.platformStatus,
        isSimulated: true,
      };
    }

    // 2. Fetch Live Weather from Open-Meteo
    try {
      // Open-Meteo API for current rain and temperature
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain&timezone=auto`;
      const response = await axios.get(url);
      const current = response.data.current;

      return {
        rain: current.rain || 0, // mm
        temp: current.temperature_2m,
        aqi: 45, // Static fallback as Open-Meteo doesn't provide AQI in free basic tier
        platformStatus: 'online',
        isSimulated: false,
      };
    } catch (e) {
      console.error('Weather API failed, using defaults:', e.message);
      return {
        rain: 0,
        temp: 28,
        aqi: 50,
        platformStatus: 'online',
        isSimulated: true,
        error: 'API_OFFLINE_FALLBACK',
      };
    }
  }
}
