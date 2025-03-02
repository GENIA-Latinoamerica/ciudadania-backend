import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
