import { Project } from "../schemas/project.schema";
import { CategoryModel } from "./category.model";

export class ProjectModel {
  _id: string;
  name: string;
  image: string;
  category: CategoryModel;

  constructor(item: Project) {
    this._id = item._id;
    this.name = item.name;
    this.image = item.image;
  }
}
