import { Module, RequestMethod } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { FileRepository } from './file.repository';
import { AuthMiddleware } from '@app/api-commons/middlewares/auth.middleware';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';
import databaseConfig from 'apps/api-user/config/database.config';
import { UserService } from '../user/user.service';
import { FileUploadUtils } from '@app/api-commons/utils/file-upload.utils';
import { UserRepository } from '../user/user.repository';
import { User, UserSchema } from '@app/api-commons/schemas/user.schema';
import { File, FileSchema } from '@app/api-commons/schemas/file.schema';
import { Project, ProjectSchema } from '@app/api-commons/schemas/project.schema';
import { ProjectService } from '../project/project.service';
import { ProjectRepository } from '../project/project.repository';
import { CategoryService } from '../category/category.service';
import { CategoryRepository } from '../category/category.repository';
import { Category, CategorySchema } from '@app/api-commons/schemas/category.schema';
import { RandomStringService } from '../user/utils/random-string.service';
import { ApiNotificationClient } from '@app/api-commons/api-clients/internal-clients/notification';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `apps/api-user/.env`,
      load: [databaseConfig],
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
      { name: File.name, schema: FileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [FileController],
  providers: [FileService, UserRepository, FileRepository, ApiAuthClient, UserService, FileUploadUtils, ProjectService, ProjectRepository, CategoryService, CategoryRepository, RandomStringService, ApiNotificationClient],
})
export class FileModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes(
        { path: '*/file/*', method: RequestMethod.ALL },
        { path: '*/file', method: RequestMethod.ALL }
      );
  }
}
