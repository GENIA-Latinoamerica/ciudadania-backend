import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriptionRequestDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

}
