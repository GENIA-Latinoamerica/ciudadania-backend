import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  _id: string;

  @Prop({ required: true, default: Date.now() })
  date: Date;

  @Prop({ required: true })
  jwt: string;

  @Prop({ required: true })
  valid: boolean;

  @Prop({ type: 'string', ref: 'User' })
  user: string;

  @Prop({ type: 'string' })
  client: string;

  @Prop({ type: 'string', required: false })
  pme_token: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
