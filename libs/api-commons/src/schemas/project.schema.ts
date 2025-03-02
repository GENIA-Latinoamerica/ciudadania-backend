import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';
import { Category } from './category.schema';
import mongoose from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project extends Base {
  _id: string;

  @Prop()
  name: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Category.name })
  category: Category;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
