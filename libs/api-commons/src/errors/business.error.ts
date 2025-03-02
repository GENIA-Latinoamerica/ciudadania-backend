import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
