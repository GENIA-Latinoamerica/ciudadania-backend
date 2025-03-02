import { IToken } from '../../interfaces/token.interface';
import { Injectable } from '@nestjs/common';
import { ApiBase } from './base';
import { InternalError } from '../../errors/internal-error.error';
import { CommonErrorsEnum } from '../../enums/common-errors.enum';
import { TokenDto } from '@app/api-commons/dtos/token.dto';

@Injectable()
export class ApiAuthClient extends ApiBase {
  async getPmeToken(token: IToken): Promise<TokenDto> {
    const responseUser = await this._getMethod(
      token.jwt,
      `${process.env.API_AUTH}/v1/auth/pme_token`,
    );
    if (responseUser.status === 200 && !responseUser.data.error) {
      return responseUser.data;
    } else {
      throw new InternalError(CommonErrorsEnum.NETWORK_ERROR);
    }
  }

  async verifyToken(token: string): Promise<IToken> {
    const responseUser = await this._getMethod(
      token,
      `${process.env.API_AUTH}/v1/auth/verify`,
    );
    if (responseUser.status === 200 && !responseUser.data.error) {
      return responseUser.data;
    } else {
      throw new InternalError(CommonErrorsEnum.NETWORK_ERROR);
    }
  }
}
