import { Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from 'apps/api-auth/config/database.config';
import jwtConfig from 'apps/api-auth/config/jwt.config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Token, TokenSchema } from '../schemas/token.schema';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { User, UserSchema } from '@app/api-commons/schemas/user.schema';
import { TokenRepository } from './token.repository';
import { UserRepository } from 'apps/api-user/src/user/user.repository';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';
import { TokenService } from './token.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RolesGuard } from '@app/api-commons/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { Project, ProjectSchema } from '@app/api-commons/schemas/project.schema';
import { RandomStringService } from 'apps/api-user/src/user/utils/random-string.service';
import { ApiNotificationClient } from '@app/api-commons/api-clients/internal-clients/notification';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `apps/api-auth/.env`,
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
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get<JwtModuleOptions>('jwt');
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthMiddleware,
    UserRepository,
    TokenService,
    TokenRepository,
    AuthService,
    LoggerMiddleware,
    JwtService,
    ApiAuthClient,
    ApiNotificationClient,
    RandomStringService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '*/auth/validate', method: RequestMethod.ALL },
        { path: '*/auth/pme_token', method: RequestMethod.ALL },
        { path: '*/auth/change-password', method: RequestMethod.ALL },
        { path: '*/auth/complete_profile', method: RequestMethod.ALL },
        { path: '*/auth/verify', method: RequestMethod.ALL },
        { path: '*/auth/logout', method: RequestMethod.ALL },
      );
  }
}
