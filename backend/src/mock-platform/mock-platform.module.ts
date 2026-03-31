import { Module } from '@nestjs/common';
import { MockPlatformService } from './mock-platform.service';

@Module({
  providers: [MockPlatformService],
  exports: [MockPlatformService],
})
export class MockPlatformModule {}
