import { GenderEnum } from '@app/api-commons/enums/gender.enum';
import { IDTypeEnum } from '@app/api-commons/enums/id_type.enum';
import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpRequestDto {
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

  @IsNotEmpty()
  @IsString()
  password: string;

}
