import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { ResetCode } from '@app/api-commons/schemas/reset-code.schema';
import { ProjectModel } from './project.model';
import { User } from '../schemas/user.schema';
import { Project } from '../schemas/project.schema';

export class UserModel {
  _id: string;
  firstname: string;
  email: string;
  lastname: string;
  roles: [RoleEnum];
  projects: ProjectModel[];
  reset_code: ResetCode;
  must_change_password: boolean;

  constructor(item: User) {
    this._id = item._id;
    this.firstname = item.firstname;
    this.lastname = item.lastname;
    this.email = item.email;
    this.roles = item.roles;
    this.lastname = item.lastname;
    this.projects = item.projects.map( (x : Project) => new ProjectModel(x));
    this.reset_code = item.reset_code;
    this.must_change_password = item.must_change_password;
  }
}
