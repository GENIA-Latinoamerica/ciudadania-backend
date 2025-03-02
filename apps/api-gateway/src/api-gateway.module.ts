import { Module, RequestMethod } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { ReverseProxyMiddleware } from './middlewares/reverse-proxy.middleware';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import jwtConfig from '../config/jwt.config';
import { ApiGwMiddleware } from './middlewares/api-gw.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `apps/api-gateway/.env`,
      load: [databaseConfig, jwtConfig],
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, ReverseProxyMiddleware],
})
export class ApiGatewayModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, ApiGwMiddleware, ReverseProxyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
