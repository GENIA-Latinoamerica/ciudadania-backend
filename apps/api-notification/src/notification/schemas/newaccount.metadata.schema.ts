import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class NewAccountMetadata {
  @Prop({ required: true })
  password: string;
}

export const NewAccountMetadataSchema = SchemaFactory.createForClass(NewAccountMetadata);
