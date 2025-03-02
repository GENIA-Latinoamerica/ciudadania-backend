import { Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationRepository } from './notification.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ApiUserClient } from '@app/api-commons/api-clients/internal-clients/user';
import databaseConfig from 'apps/api-notification/config/database.config';
import jwtConfig from 'apps/api-auth/config/jwt.config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserSchema } from '@app/api-commons/schemas/user.schema';
import { LoggerMiddleware } from '@app/api-commons/middlewares/logger.middleware';
import { AuthMiddleware } from '@app/api-commons/middlewares/auth.middleware';
import { NotificationController } from './notification.controller';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';

export interface ModuleOptions {
  notification: { useFactory: (notificationRepository: NotificationRepository) => { provide: NotificationRepository } },
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
          envFilePath: `apps/api-notification/.env`,
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
              { name: Notification.name, schema: NotificationSchema },
              { name: User.name, schema: UserSchema }
            ]),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_DOMAIN,
        port: process.env.SMTP_PORT,
        auth: {
          user: `${process.env.EMAIL_USER}`,
          pass: `${process.env.EMAIL_PASSWORD}`,
        },
      },
      defaults: {
        from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_FROM}>`,
      },
      template: {
        dir: __dirname + '/templates/emails',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [NotificationController ],
  providers: [
    { provide: NotificationRepository, useClass: NotificationRepository },
    ApiAuthClient,
    NotificationService,
    ApiUserClient,
  ],
})
export class NotificationModule  {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: '*/notification/*', method: RequestMethod.ALL },
        { path: '*/notification', method: RequestMethod.ALL }
      );
  }
}
