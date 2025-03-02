import { Body, Controller, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { NotificationService } from './notification.service';
import { UserDto } from '@app/api-commons/dtos/user.dto';
import { CreateNotificationDto } from '@app/api-commons/dtos/create-user-notification.dto';
import { ResetPasswordNotificationDto } from '@app/api-commons/dtos/reset-password-notification.dto';

@Controller({
    version: '1',
    path: 'notification',
})
export class NotificationController {
    constructor(
      private readonly notificationSytemService: NotificationService) {
    }

    @Post("/signup")
    async signup(
    @Req() req: any,
    @Res() res: Response,
    @Body() item: CreateNotificationDto,
    ){
        await this.notificationSytemService.signup(item.userId, item.password);
        return res.status(HttpStatus.OK).json();
    }

    @Post("/reset-password")
    async resetPassword(
        @Req() req: any,
        @Body() item: ResetPasswordNotificationDto,
        @Res() res: Response,
    ){
        await this.notificationSytemService.resetPassword(item.userId, item.code);
        return res.status(HttpStatus.OK).json();
    }
}
