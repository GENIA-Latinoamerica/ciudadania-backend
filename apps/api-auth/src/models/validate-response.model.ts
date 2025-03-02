import { UserModel } from '@app/api-commons/models/user.model';

export class ValidateResponseModel {
  user: UserModel;
  must_complete: boolean;

  constructor(user: UserModel, must_complete: boolean) {
    this.user = user;
    this.must_complete = must_complete;
  }
}
