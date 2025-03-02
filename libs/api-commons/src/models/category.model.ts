import { Category } from "../schemas/category.schema";
import { Project } from "../schemas/project.schema";
import { ProjectModel } from "./project.model";

export class CategoryModel {
  _id: string;
  name: string;
  image: string;
  projects: ProjectModel[];

  constructor(item: Category, projects?: Project[]) {
    this._id = item._id;
    this.name = item.name;
    this.image = item.image;
    if(projects)
      this.projects = projects.map(( x: Project )=> new ProjectModel(x));
  }
}
