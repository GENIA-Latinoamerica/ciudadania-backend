import { Module, RequestMethod } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { SubscriptionRepository } from './subscription.repository';
import { AuthMiddleware } from '@app/api-commons/middlewares/auth.middleware';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';
import { Subscription, SubscriptionSchema } from '@app/api-commons/schemas/subscription.schema';
import { User, UserSchema } from '@app/api-commons/schemas/user.schema';
import jwtConfig from 'apps/api-user/config/jwt.config';
import databaseConfig from 'apps/api-user/config/database.config';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { RandomStringService } from '../user/utils/random-string.service';
import { ApiNotificationClient } from '@app/api-commons/api-clients/internal-clients/notification';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `apps/api-subscription/.env`,
      load: [databaseConfig, jwtConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'test') {
          const mongod = await MongoMemoryServer.create();
          const uri = mongod.getUri();
          return { uri };
        }
        return { uri: configService.get<string>('database.uri') };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository, ApiAuthClient, UserRepository, UserService, RandomStringService, ApiNotificationClient],
})
export class SubscriptionModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .exclude(
        { path: '*/subscription', method: RequestMethod.POST }
      )
      .forRoutes(
        { path: '*/subscription/*', method: RequestMethod.GET },
        { path: '*/subscription', method: RequestMethod.GET },
        { path: '*/subscription/*', method: RequestMethod.PUT }
      );
  }
}
