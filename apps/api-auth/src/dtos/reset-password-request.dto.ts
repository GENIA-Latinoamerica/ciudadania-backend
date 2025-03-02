import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
