import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CodeEmailMetadata {
  @Prop({ required: true })
  code: string;
}

export const CodeEmailMetadataSchema = SchemaFactory.createForClass(CodeEmailMetadata);
