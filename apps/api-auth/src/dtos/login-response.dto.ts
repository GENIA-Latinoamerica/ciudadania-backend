import { UserDto } from '@app/api-commons/dtos/user.dto';
import { UserModel } from '@app/api-commons/models/user.model';

export class LoginResponseDto {
  user: UserDto;
  jwt: string;
  must_complete: boolean;

  constructor(user: UserModel, jwt: string, must_complete?: boolean) {
    this.user = new UserDto(user);
    this.jwt = jwt;
    this.must_complete = must_complete;
  }
}
