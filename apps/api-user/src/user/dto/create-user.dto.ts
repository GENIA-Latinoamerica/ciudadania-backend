import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

}
