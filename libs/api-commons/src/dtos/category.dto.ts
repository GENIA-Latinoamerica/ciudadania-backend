import { CategoryModel } from '../models/category.model';
import { ProjectModel } from '../models/project.model';
import { ProjectDto } from './project.dto';
export class CategoryDto {
  _id: string;
  name: string;
  image: string;
  projects: ProjectDto[];

  constructor(model: CategoryModel) {
    this._id = model._id;
    this.name = model.name;
    this.image = model.image;
    this.projects = model.projects.map((x: ProjectModel) => new ProjectDto(x))
  }
}
