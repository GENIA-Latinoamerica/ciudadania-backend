import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';
import { NotificationTypeEnum } from '@app/api-commons/enums/notification-type.enum';
import { NotificationChannelEnum } from '@app/api-commons/enums/notification-channel.enum';
import { NotificationStatusEnum } from '@app/api-commons/enums/notification-status.enum';
import { CodeEmailMetadata, CodeEmailMetadataSchema } from './codemail.metadata.schema';
import { NewAccountMetadata } from './newaccount.metadata.schema';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification extends Base {
  _id: string;
  
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  body: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: String, required: true })
  type: NotificationTypeEnum;

  @Prop({ type: String, required: true })
  channel: NotificationChannelEnum;

  @Prop({ type: String, required: true })
  status: NotificationStatusEnum;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: false })
  error: string;

  @Prop({ type: Object, required: false })
  metadata: CodeEmailMetadata | NewAccountMetadata;
}
  
export const NotificationSchema = SchemaFactory.createForClass(Notification);
