import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ByDate, ByDateSchema } from './by-date.schema';
import { Deleted, DeletedSchema } from './deleted.schema';

@Schema()
export class Base {
  @Prop({ type: ByDateSchema, required: true })
  created: ByDate;

  @Prop({ type: ByDateSchema })
  updated: ByDate;

  @Prop({ type: DeletedSchema, required: true })
  deleted: Deleted;
}

export const BaseSchema = SchemaFactory.createForClass(Base);
