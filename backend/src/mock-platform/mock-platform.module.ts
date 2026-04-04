import { Module } from '@nestjs/common';
import { MockPlatformService } from './mock-platform.service';
import { MockController } from './mock-controller';

@Module({
  controllers: [MockController],
  providers: [MockPlatformService],
  exports: [MockPlatformService],
})
export class MockPlatformModule {}
