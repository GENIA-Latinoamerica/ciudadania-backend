import { Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from '@app/api-commons/schemas/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { UserRepository } from './user.repository';
import { AuthMiddleware } from '@app/api-commons/middlewares/auth.middleware';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';
import databaseConfig from 'apps/api-user/config/database.config';
import jwtConfig from 'apps/api-user/config/jwt.config';
import { Project, ProjectSchema } from '@app/api-commons/schemas/project.schema';
import { RandomStringService } from './utils/random-string.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `apps/api-user/.env`,
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
      { name: Project.name, schema: ProjectSchema }
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, ApiAuthClient, RandomStringService],
})
export class UserModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .exclude(
        { path: '*/user/internal/(.*)', method: RequestMethod.GET }
      )
      .forRoutes(
        { path: '*/user/:id', method: RequestMethod.ALL },
        { path: '*/user', method: RequestMethod.ALL },
      );
  }
}
