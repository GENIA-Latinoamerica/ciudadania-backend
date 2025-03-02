import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';
import { User } from './user.schema';
import mongoose from 'mongoose';
import { SubscriptionEnum } from '../enums/subscription.enum';

export type SubscriptionDocument = Subscription & Document;

@Schema()
export class Subscription extends Base {
  _id: string;

  @Prop()
  firstname: string;

  @Prop({ required: false })
  lastname: string;

  @Prop()
  email: string;

  @Prop()
  comment: string;

  @Prop()
  completed: boolean;

@Prop({ type: String })
  status: SubscriptionEnum;

  @Prop({
      required: false,
      type: mongoose.Schema.Types.ObjectId,
      ref: User.name,
    })
    user: User;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
