import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.OPENWEATHER_API_KEY || 'MOCK_KEY';

  constructor(private prisma: PrismaService) {}

  async getCurrentWeather(lat: number = 19.076, lon: number = 72.877) {
    // Check for the most recent environment setting
    const latestState = await this.prisma.environmentState.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    // If the latest state is specifically marked as NOT simulated, try real API
    if (latestState && !latestState.isSimulated) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
        );
        const data = response.data;
        return {
          rain: data.rain ? data.rain['1h'] || 0 : 0,
          temp: data.main.temp,
          aqi: 50,
          isSimulated: false,
        };
      } catch (e) {
        // Fallback to the last saved weather if API fails
        return {
          rain: latestState.rain,
          temp: latestState.temperature,
          aqi: latestState.aqi,
          isSimulated: true,
          error: 'API_FAILED_FALLBACK',
        };
      }
    }

    // Default to the latest simulated state if it exists
    if (latestState) {
      return {
        rain: latestState.rain,
        temp: latestState.temperature,
        aqi: latestState.aqi,
        isSimulated: true,
      };
    }

    // Attempt real API call if no simulation or if explicit override
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
      );
      const data = response.data;
      return {
        rain: data.rain ? data.rain['1h'] || 0 : 0,
        temp: data.main.temp,
        aqi: 50, // Default for now
        isSimulated: false,
      };
    } catch (e) {
      // Fallback to safe defaults if API fails
      return {
        rain: 0,
        temp: 30,
        aqi: 50,
        isSimulated: true,
        error: 'API_FAILED',
      };
    }
  }
}
