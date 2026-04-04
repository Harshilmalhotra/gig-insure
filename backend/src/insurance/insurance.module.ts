import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { WeatherModule } from '../weather/weather.module';

import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [WeatherModule, StorageModule],
  controllers: [InsuranceController],
  providers: [InsuranceService],
})
export class InsuranceModule {}

