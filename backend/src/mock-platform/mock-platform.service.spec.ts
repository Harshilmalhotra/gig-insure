import { Test, TestingModule } from '@nestjs/testing';
import { MockPlatformService } from './mock-platform.service';

describe('MockPlatformService', () => {
  let service: MockPlatformService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockPlatformService],
    }).compile();

    service = module.get<MockPlatformService>(MockPlatformService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
