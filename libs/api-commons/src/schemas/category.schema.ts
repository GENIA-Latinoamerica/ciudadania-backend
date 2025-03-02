import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';

export type CategoryDocument = Category & Document;

@Schema()
export class Category extends Base {
  _id: string;

  @Prop()
  name: string;

  @Prop({ required: false })
  image: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
