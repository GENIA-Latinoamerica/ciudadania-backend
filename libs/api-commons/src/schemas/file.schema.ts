import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';
import { Project } from './project.schema';
import mongoose from 'mongoose';

export type FileDocument = File & Document;

@Schema()
export class File extends Base {
  _id: string;

  @Prop()
  name: string;

  @Prop({ required: false })
  path: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  project: Project;
}

export const FileSchema = SchemaFactory.createForClass(File);
