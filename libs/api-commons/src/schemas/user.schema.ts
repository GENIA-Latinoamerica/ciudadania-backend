import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '@app/api-commons/schemas/base.schema';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { ResetCodeSchema, ResetCode } from './reset-code.schema';
import { IDTypeEnum } from '../enums/id_type.enum';
import { GenderEnum } from '../enums/gender.enum';
import { Project } from './project.schema';
import mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User extends Base {
  _id: string;

  @Prop()
  firstname: string;

  @Prop({ required: false })
  password: string;

  @Prop()
  email: string;

  @Prop()
  lastname: string;

  @Prop()
  must_complete: boolean;

  @Prop()
  must_change_password: boolean;

  @Prop({ type: Array })
  roles: [RoleEnum];

  @Prop({ type: ResetCodeSchema })
  reset_code: ResetCode;

  @Prop([{
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }])
  projects: Project[];


}

export const UserSchema = SchemaFactory.createForClass(User);
