import { RoleEnum } from '../enums/role.enum';

export interface IToken {
  _id: string;
  email: string;
  roles: [RoleEnum];
  jwt?: string;
}
