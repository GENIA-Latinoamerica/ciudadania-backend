import { Injectable } from '@nestjs/common';
import { ApiBase } from './base';
import { InternalError } from '../../errors/internal-error.error';
import { CommonErrorsEnum } from '../../enums/common-errors.enum';
import { UserDto } from '@app/api-commons/dtos/user.dto';

@Injectable()
export class ApiUserClient extends ApiBase {
  async getUser(token: string, _id: string): Promise<UserDto> {
    const responseUser = await this._getMethod(
      token,
      `${process.env.API_USER}/v1/user/${_id}`,
    );
    if (responseUser.status === 200 && !responseUser.data.error) {
      return responseUser.data;
    } else {
      throw new InternalError(CommonErrorsEnum.NETWORK_ERROR);
    }
  }

  async getUserForInternalUse(_id: string): Promise<UserDto> {
    const responseUser = await this._getMethod(
      undefined,
      `${process.env.API_USER}/v1/user/internal/${_id}`,
    );
    if (responseUser.status === 200 && !responseUser.data.error) {
      return responseUser.data;
    } else {
      throw new InternalError(CommonErrorsEnum.NETWORK_ERROR);
    }
  }
}
