import { Module } from '@nestjs/common';
import { ApiCommonsService } from './api-commons.service';

@Module({
  providers: [ApiCommonsService],
  exports: [ApiCommonsService],
  imports: [],
})
export class ApiCommonsModule {}
