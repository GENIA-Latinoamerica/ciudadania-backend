import { UserModel } from '@app/api-commons/models/user.model';

export class LoginResponseModel {
  user: UserModel;
  jwt: string;
  must_complete: boolean;

  constructor(user: UserModel, jwt: string, must_complete?: boolean) {
    this.user = user;
    this.jwt = jwt;
    this.must_complete = must_complete;
  }
}
