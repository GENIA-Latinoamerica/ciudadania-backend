import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProxyTargetsModel } from '../models/proxy-targets.model';

@Injectable()
export class ApiGwMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiGwMiddleware.name);

  constructor() {}

  getOptions(url: string) {
    const targets = [
      {
        src: '/api/v1/auth',
        target: 'http://localhost:3001',
      },
      {
        src: '/api/v1/user',
        target: 'http://localhost:3002',
      },
      {
        src: '/api/v1/project',
        target: 'http://localhost:3002',
      },
      {
        src: '/api/v1/subscription',
        target: 'http://localhost:3002',
      },
      {
        src: '/api/v1/category',
        target: 'http://localhost:3002',
      },
      {
        src: '/api/v1/notification',
        target: 'http://localhost:3003',
      },
    ];
    return targets.find((target: ProxyTargetsModel) =>
      url.includes(target.src),
    );
  }
  async use(req: Request, res: Response, next: NextFunction) {
    const response = this.getOptions(req.originalUrl);
    req.proxyTarjetUrl = response.target;
    next();
  }
}
