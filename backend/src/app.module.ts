import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';
import { MockPlatformModule } from './mock-platform/mock-platform.module';
import { InsuranceModule } from './insurance/insurance.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    WeatherModule, 
    MockPlatformModule, 
    InsuranceModule, 
    AuthModule, 
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
