import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ByDate {
  @Prop({ required: false })
  by: string;

  @Prop({ required: true, default: Date.now() })
  date: Date;

  constructor(user: string) {
    this.by = user;
    this.date = new Date();
  }
}

export const ByDateSchema = SchemaFactory.createForClass(ByDate);
