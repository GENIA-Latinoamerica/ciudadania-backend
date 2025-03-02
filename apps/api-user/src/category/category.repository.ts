import { BaseRepository } from '@app/api-commons/repository/base.repository';
import { Category, CategoryDocument } from '@app/api-commons/schemas/category.schema';
import { Deleted } from '@app/api-commons/schemas/deleted.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepository extends BaseRepository {
  constructor(
    @InjectModel(Category.name) protected categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  public async findAll(): Promise<Category[]> {
    return this.categoryModel.find();
  }

  public async create(category: Category): Promise<Category> {
    category.created = {
      by: category._id,
      date: new Date(),
    };
    category.deleted = new Deleted();
    return this.categoryModel.create(category);
  }

  public async updateOne(category: Category): Promise<Category> {
    category.updated = {
      by: category._id,
      date: new Date(),
    };
    return this.categoryModel.findByIdAndUpdate(category._id, category, {
      new: true,
    });
  }

  public async findOneById(_id: string): Promise<Category> {
    return this.categoryModel.findOne({
      _id,
      'deleted.status': false,
    });
  }

  public async findOneByName(name: string): Promise<Category> {
    return this.categoryModel.findOne({
      name,
      'deleted.status': false,
    });
  }

}
