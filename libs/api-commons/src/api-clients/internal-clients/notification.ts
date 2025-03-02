import { Injectable } from '@nestjs/common';
import { ApiBase } from './base';
import { InternalError } from '../../errors/internal-error.error';
import { CommonErrorsEnum } from '../../enums/common-errors.enum';
import { UserDto } from '@app/api-commons/dtos/user.dto';
import { CreateNotificationDto } from '@app/api-commons/dtos/create-user-notification.dto';
import { ResetPasswordNotificationDto } from '@app/api-commons/dtos/reset-password-notification.dto';

@Injectable()
export class ApiNotificationClient extends ApiBase {
  async createUser(_id: string, password: string): Promise<UserDto> {

    const responseUser = await this._postMethod(
      null,
      `${process.env.API_NOTIFICATION}/v1/notification/signup`,
      new CreateNotificationDto(_id, password)
    );
    if (responseUser.status === 200 && !responseUser.data.error) {
      return responseUser.data;
    } else {
      throw new InternalError(CommonErrorsEnum.NETWORK_ERROR);
    }
  }

  async resetPassword(_id: string, code: string): Promise<UserDto> {

    const responseUser = await this._postMethod(
      null,
      `${process.env.API_NOTIFICATION}/v1/notification/reset-password`,
      new ResetPasswordNotificationDto(_id, code)
    );
    if (responseUser.status === 200 && !responseUser.data.error) {
      return responseUser.data;
    } else {
      throw new InternalError(CommonErrorsEnum.NETWORK_ERROR);
    }
  }
}
