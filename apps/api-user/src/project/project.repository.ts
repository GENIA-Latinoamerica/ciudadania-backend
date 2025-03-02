import { BaseRepository } from '@app/api-commons/repository/base.repository';
import { Deleted } from '@app/api-commons/schemas/deleted.schema';
import { Project, ProjectDocument } from '@app/api-commons/schemas/project.schema';
import { User } from '@app/api-commons/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProjectRepository extends BaseRepository {
  constructor(
    @InjectModel(Project.name) protected projectModel: Model<ProjectDocument>,
  ) {
    super(projectModel);
  }

  public async findAll(): Promise<Project[]> {
    return this.projectModel.find().populate('category');;
  }

  public async create(project: Project): Promise<Project> {
    project.created = {
      by: project._id,
      date: new Date(),
    };
    project.deleted = new Deleted();
    return this.projectModel.create(project);
  }

  public async updateOne(project: Project, user: string): Promise<Project> {
    project.updated = {
      by: user,
      date: new Date(),
    };
    return this.projectModel.findByIdAndUpdate(project._id, project, {
      new: true,
    });
  }

  public async deleteOne(project: Project, user: string): Promise<Project> {
    project.deleted = {
      by: user,
      date: new Date(),
      status: true,
    };
    return this.projectModel.findByIdAndUpdate(project._id, project, {
      new: true,
    });
  }

  public async findOneById(_id: string): Promise<Project> {
    return this.projectModel.findOne({
      _id,
      'deleted.status': false,
    })
    .populate('category');
  }

  public async findAllByCategory(category: string): Promise<Project[]> {
    return this.projectModel.find({
      category,
      'deleted.status': false,
    });
  }

  public async findOneByName(name: string): Promise<Project> {
    return this.projectModel.findOne({
      name,
      'deleted.status': false,
    })
    .populate('category');
  }

}
