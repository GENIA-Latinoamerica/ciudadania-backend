import { Injectable, Logger } from '@nestjs/common';;
import { ApiUserClient } from '@app/api-commons/api-clients/internal-clients/user';
import { UserDto } from '@app/api-commons/dtos/user.dto';
import { NotificationRepository } from './notification.repository';
import { Notification } from './schemas/notification.schema';
import { NotificationChannelEnum } from '@app/api-commons/enums/notification-channel.enum';
import { NotificationTypeEnum } from '@app/api-commons/enums/notification-type.enum';
import { NotificationStatusEnum } from '@app/api-commons/enums/notification-status.enum';
import { CodeEmailMetadata } from './schemas/codemail.metadata.schema';
import { NewAccountMetadata } from './schemas/newaccount.metadata.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
    private logger = null;
    constructor(
        private readonly apiUserClient: ApiUserClient,
        private readonly mailerService: MailerService,
        private readonly notificationRepository: NotificationRepository,
    ) {
        this.logger = new Logger(NotificationService.name);
    }


    async signup(userId: string, password: string): Promise<Notification> {
        const title: string = 'Ciudadania - Cuenta Confirmada Exitosamente!';
        const notification = new Notification();
        notification.title = title;
        notification.channel = NotificationChannelEnum.EMAIL;
        notification.type = NotificationTypeEnum.ACCOUNT_CREATED;
        notification.status = NotificationStatusEnum.PENDING;
        notification.userId = userId;
        notification.date = new Date();

        const metadata = new NewAccountMetadata();
        metadata.password = password;
        notification.metadata = metadata;
        
        await this.notificationRepository.create(notification);
        console.log('userId', userId);
        const user: UserDto = await this.apiUserClient.getUserForInternalUse(userId);

        await this.mailerService
      .sendMail({
        to: user.email, // list of receivers
        subject: notification.title,
        template: 'create_account', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
            name: user.firstname,
            password: notification.metadata.password,
            web_url: 'https://ciudadania.net'

        },
      })
      .then(() => {
        notification.status = NotificationStatusEnum.SENT;
        //this.logger.log(`${notification.type} - EMAIL SENT FOR ${user.email}`);
        notification.status = NotificationStatusEnum.SENT;
        this.notificationRepository.updateOne(notification)
      })
      .catch((e) => {
        this.logger.error(e);
        notification.status = NotificationStatusEnum.ERROR;
        this.notificationRepository.updateOne(notification)
      });
        return;
    }

    async resetPassword(userId: string, code: string): Promise<Notification> {
      const title: string = 'Ciudadania - Reiniciar Contraseña';
      const notification = new Notification();
      notification.title = title;
      notification.channel = NotificationChannelEnum.EMAIL;
      notification.type = NotificationTypeEnum.PASSWORD_RESET;
      notification.status = NotificationStatusEnum.PENDING;
      notification.userId = userId;
      notification.date = new Date();

      const metadata = new CodeEmailMetadata();
      metadata.code = code;
      notification.metadata = metadata;
      
      await this.notificationRepository.create(notification);
      console.log('userId', userId);
      const user: UserDto = await this.apiUserClient.getUserForInternalUse(userId);

      await this.mailerService
    .sendMail({
      to: user.email, // list of receivers
      subject: notification.title,
      template: 'reset_password', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
      context: {
          name: user.firstname,
          code: notification.metadata.code,
          web_url: 'https://ciudadania.net'

      },
    })
    .then(() => {
      notification.status = NotificationStatusEnum.SENT;
      //this.logger.log(`${notification.type} - EMAIL SENT FOR ${user.email}`);
      notification.status = NotificationStatusEnum.SENT;
      this.notificationRepository.updateOne(notification)
    })
    .catch((e) => {
      this.logger.error(e);
      notification.status = NotificationStatusEnum.ERROR;
      this.notificationRepository.updateOne(notification)
    });
      return;
  }

}
