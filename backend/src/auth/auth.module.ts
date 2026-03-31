import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MockPlatformModule } from '../mock-platform/mock-platform.module';

@Module({
  imports: [MockPlatformModule],
  controllers: [AuthController],
})
export class AuthModule {}
