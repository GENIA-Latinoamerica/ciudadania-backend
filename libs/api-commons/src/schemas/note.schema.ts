import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';
import { Project } from './project.schema';
import mongoose from 'mongoose';

export type NoteDocument = Note & Document;

@Schema()
export class Note extends Base {
  _id: string;

  @Prop()
  title: string;

  @Prop({ required: false })
  content: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  project: Project;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
