import { ProjectModel } from '@app/api-commons/models/project.model';
import { UserModel } from '@app/api-commons/models/user.model';
import { BaseRepository } from '@app/api-commons/repository/base.repository';
import { Deleted } from '@app/api-commons/schemas/deleted.schema';
import { File, FileDocument } from '@app/api-commons/schemas/file.schema';
import { Project } from '@app/api-commons/schemas/project.schema';
import { User } from '@app/api-commons/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FileRepository extends BaseRepository {
  constructor(
    @InjectModel(File.name) protected fileModel: Model<FileDocument>,
  ) {
    super(fileModel);
  }

  public async findAll(): Promise<File[]> {
    return this.fileModel.find();
  }

  public async create(file: File): Promise<File> {
    file.created = {
      by: file._id,
      date: new Date(),
    };
    file.deleted = new Deleted();
    return this.fileModel.create(file);
  }

  public async updateOne(file: File): Promise<File> {
    file.updated = {
      by: file._id,
      date: new Date(),
    };
    return this.fileModel.findByIdAndUpdate(file._id, file, {
      new: true,
    });
  }

  public async findOneById(_id: string): Promise<File> {
    return this.fileModel.findOne({
      _id,
      'deleted.status': false,
    });
  }

  public async findOneByNameAndProject(name: string, project: Project): Promise<File> {
    return this.fileModel.findOne({
      name,
      project,
      'deleted.status': false,
    });
  }

  public async findByProject(project: Project): Promise<File[]> {
    return this.fileModel.find({
      project,
      'deleted.status': false,
    });
  }

  public async deleteOne(file: File, loggedUser: UserModel): Promise<File> {
    file.deleted = {
      by: loggedUser._id,
      date: new Date(),
      status: true,
    };
    return this.fileModel.findByIdAndUpdate(file._id, file, {
      new: true,
    });
  }

}
