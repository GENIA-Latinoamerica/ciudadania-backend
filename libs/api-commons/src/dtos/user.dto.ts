import { RoleEnum } from '../enums/role.enum';
import { ProjectModel } from '../models/project.model';
import { UserModel } from '../models/user.model';
import { ProjectDto } from './project.dto';
export class UserDto {
  _id: string;
  firstname: string;
  email: string;
  lastname: string;
  roles: [RoleEnum];
  projects: ProjectDto[];
  must_change_password: boolean;

  constructor(model: UserModel) {
    this._id = model._id;
    this.firstname = model.firstname;
    this.lastname = model.lastname;
    this.email = model.email;
    this.roles = model.roles;
    this.must_change_password = model.must_change_password;

    this.projects = model.projects.map( (x: ProjectModel) => new ProjectDto(x));
  }
}
