import { UserDto } from '@app/api-commons/dtos/user.dto';
import { UserModel } from '@app/api-commons/models/user.model';

export class ValidateResponseDto {
  user: UserDto;
  must_complete: boolean;

  constructor(user: UserModel, must_complete: boolean) {
    this.user = new UserDto(user);
    this.must_complete = must_complete;
  }
}
