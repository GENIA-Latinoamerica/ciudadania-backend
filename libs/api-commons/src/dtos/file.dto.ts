import { File } from "../schemas/file.schema";

export class FileDto {
  _id: string;
  name: string;
  path: string;

  constructor(model: File) {
    this._id = model._id;
    this.name = model.name;
    this.path = model.path;
  }
}
