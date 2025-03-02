import { ProjectModel } from '@app/api-commons/models/project.model';
import { UserModel } from '@app/api-commons/models/user.model';
import { BaseRepository } from '@app/api-commons/repository/base.repository';
import { Deleted } from '@app/api-commons/schemas/deleted.schema';
import { Note, NoteDocument } from '@app/api-commons/schemas/note.schema';
import { Project } from '@app/api-commons/schemas/project.schema';
import { User } from '@app/api-commons/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NoteRepository extends BaseRepository {
  constructor(
    @InjectModel(Note.name) protected noteModel: Model<NoteDocument>,
  ) {
    super(noteModel);
  }

  public async findAll(): Promise<Note[]> {
    return this.noteModel.find();
  }

  public async create(note: Note): Promise<Note> {
    note.created = {
      by: note._id,
      date: new Date(),
    };
    note.deleted = new Deleted();
    return this.noteModel.create(note);
  }

  public async updateOne(note: Note): Promise<Note> {
    note.updated = {
      by: note._id,
      date: new Date(),
    };
    return this.noteModel.findByIdAndUpdate(note._id, note, {
      new: true,
    });
  }

  public async findOneById(_id: string): Promise<Note> {
    return this.noteModel.findOne({
      _id,
      'deleted.status': false,
    });
  }

  public async findOneByTitleAndProject(title: string, project: Project): Promise<Note> {
    return this.noteModel.findOne({
      title,
      project,
      'deleted.status': false,
    });
  }

  public async findByProject(project: Project): Promise<Note[]> {
    return this.noteModel.find({
      project,
      'deleted.status': false,
    });
  }

  public async deleteOne(note: Note, loggedUser: UserModel): Promise<Note> {
    note.deleted = {
      by: loggedUser._id,
      date: new Date(),
      status: true,
    };
    return this.noteModel.findByIdAndUpdate(note._id, note, {
      new: true,
    });
  }

}
