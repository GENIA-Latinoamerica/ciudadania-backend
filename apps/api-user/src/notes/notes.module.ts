import { Module, RequestMethod } from '@nestjs/common';
import { NoteController } from './notes.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { NoteRepository } from './notes.repository';
import { AuthMiddleware } from '@app/api-commons/middlewares/auth.middleware';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';
import databaseConfig from 'apps/api-user/config/database.config';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { User, UserSchema } from '@app/api-commons/schemas/user.schema';
import { Project, ProjectSchema } from '@app/api-commons/schemas/project.schema';
import { ProjectService } from '../project/project.service';
import { ProjectRepository } from '../project/project.repository';
import { CategoryService } from '../category/category.service';
import { CategoryRepository } from '../category/category.repository';
import { Category, CategorySchema } from '@app/api-commons/schemas/category.schema';
import { RandomStringService } from '../user/utils/random-string.service';
import { Note, NoteSchema } from '@app/api-commons/schemas/note.schema';
import { NotesService } from './notes.service';
import { FileUploadUtils } from '@app/api-commons/utils/file-upload.utils';
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
      { name: Note.name, schema: NoteSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [NoteController],
  providers: [NotesService, UserRepository, NoteRepository, ApiAuthClient, UserService, ProjectService, ProjectRepository, CategoryService, CategoryRepository, RandomStringService, FileUploadUtils, ApiNotificationClient],
})
export class NoteModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes(
        { path: '*/notes/*', method: RequestMethod.ALL },
        { path: '*/notes', method: RequestMethod.ALL }
      );
  }
}
