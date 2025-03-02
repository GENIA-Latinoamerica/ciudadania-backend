import { SubscriptionEnum } from '@app/api-commons/enums/subscription.enum';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubscriptionRequestDto {
  @IsNotEmpty()
  @IsString()
  status: SubscriptionEnum;
}
