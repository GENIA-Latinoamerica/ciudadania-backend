import { Note } from "../schemas/note.schema";

export class NoteDto {
  _id: string;
  title: string;
  content : string;

  constructor(model: Note) {
    this._id = model._id;
    this.title = model.title;
    this.content = model.content;
  }
}
