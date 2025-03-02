
import { ProjectModel } from '../models/project.model';
export class ProjectDto {
  _id: string;
  name: string;
  image: string;

  constructor(model: ProjectModel) {
    this._id = model._id;
    this.name = model.name;
    this.image = model.image;
  }
}
