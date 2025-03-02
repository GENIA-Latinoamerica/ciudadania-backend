import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ApiBase {
  protected async _getMethod(token: string, partialUrl: string) {
    const headersRequest = await this.getHeaderWithJwt(token);

    const responseUser = await axios.get(partialUrl, {
      headers: headersRequest,
    });
    return responseUser;
  }

  protected async _postMethod(token: string, partialUrl: string, data: any) {
    const headersRequest = await this.getHeaderWithJwt(token);
    const responseUser = await axios.post(partialUrl, data, {
      headers: headersRequest,
    });
    return responseUser;
  }

  async getHeaderWithJwt(token: string) {
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } else {
      return {
        'Content-Type': 'application/json',
      };
    }
  }
}
