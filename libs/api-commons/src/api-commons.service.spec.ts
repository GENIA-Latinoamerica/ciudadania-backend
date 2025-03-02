import { Test, TestingModule } from '@nestjs/testing';
import { ApiCommonsService } from './api-commons.service';

describe('ApiCommonsService', () => {
  let service: ApiCommonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiCommonsService],
    }).compile();

    service = module.get<ApiCommonsService>(ApiCommonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
