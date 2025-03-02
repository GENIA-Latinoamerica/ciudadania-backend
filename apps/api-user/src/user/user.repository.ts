import { BaseRepository } from '@app/api-commons/repository/base.repository';
import { Deleted } from '@app/api-commons/schemas/deleted.schema';
import { User, UserDocument } from '@app/api-commons/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  public async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  public async create(user: User): Promise<User> {
    user.created = {
      by: user._id,
      date: new Date(),
    };
    user.deleted = new Deleted();
    return this.userModel.create(user);
  }

  public async updateOne(user: User): Promise<User> {
    user.updated = {
      by: user._id,
      date: new Date(),
    };
    return this.userModel.findByIdAndUpdate(user._id, user, {
      new: true,
    })
    .populate('projects');;
  }

  public async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({
      email,
      'deleted.status': false,
    })
    .populate('projects');
  }

  public async findOneByResetCode(code: string): Promise<User> {
    return this.userModel.findOne({
      'reset_code.code': code,
      'reset_code.valid': true,
      'deleted.status': false,
    })
    .populate('projects');
  }

  public async validateResetCode(code: string): Promise<User> {
    return this.userModel.findOne({
      'reset_code.code': code,
      'reset_code.due_date': {
        $gte: new Date()
    },
      'reset_code.valid': true,
      'deleted.status': false,
    })
  }

  public async findOneByEmailToComplete(email: string): Promise<User> {
    return this.userModel.findOne({
      email,
      'deleted.status': false,
      must_complete: true,
    })
    .populate('projects');
  }

  public async findOneById(_id: string): Promise<User> {
    return this.userModel.findOne({
      _id,
      'deleted.status': false,
      'must_change_password': false,
      must_complete: false,
    })
    .populate('projects');
  }

  public async findOneByIdForChangePassword(_id: string): Promise<User> {
    return this.userModel.findOne({
      _id,
      'deleted.status': false,
    })
    .populate('projects');
  }

  public async findOneToComplete(_id: string): Promise<User> {
    return this.userModel.findOne({
      _id,
      'deleted.status': false,
      must_complete: true,
    });
  }

  public async deleteOne(user: User, loggedUser: string): Promise<User> {
      user.deleted = {
        by: loggedUser,
        date: new Date(),
        status: true,
      };
      return this.userModel.findByIdAndUpdate(user._id, user, {
        new: true,
      });
    }
}
