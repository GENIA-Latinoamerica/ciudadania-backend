import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Deleted {
  @Prop({ required: false })
  by: string;

  @Prop({ required: false, default: Date.now() })
  date: Date;

  @Prop({ required: true, default: false })
  status: boolean;
}

export const DeletedSchema = SchemaFactory.createForClass(Deleted);
