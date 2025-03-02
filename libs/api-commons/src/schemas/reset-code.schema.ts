import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ResetCode {
  @Prop({ required: true})
  date: Date;

  @Prop({ required: true})
  due_date: Date;

  @Prop({ required: true, default: false })
  valid: boolean;

  @Prop({ required: true })
  code: string;
}

export const ResetCodeSchema = SchemaFactory.createForClass(ResetCode);
