import { BaseRepository } from '@app/api-commons/repository/base.repository';
import { Deleted } from '@app/api-commons/schemas/deleted.schema';
import { Subscription, SubscriptionDocument } from '@app/api-commons/schemas/subscription.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubscriptionRepository extends BaseRepository {
  constructor(
    @InjectModel(Subscription.name) protected subscriptionModel: Model<SubscriptionDocument>,
  ) {
    super(subscriptionModel);
  }

  public async findAll(): Promise<Subscription[]> {
    return this.subscriptionModel.find();
  }

  public async create(subscription: Subscription): Promise<Subscription> {
    subscription.created = {
      by: subscription._id,
      date: new Date(),
    };
    subscription.deleted = new Deleted();
    return this.subscriptionModel.create(subscription);
  }

  public async findOneById(_id: string): Promise<Subscription> {
    return this.subscriptionModel.findOne({
      _id,
      'deleted.status': false,
    });
  }

  public async updateOne(userId: string, item: Subscription): Promise<Subscription> {
    item.updated = {
        by: userId,
        date: new Date(),
      };
      return this.subscriptionModel.findByIdAndUpdate(item._id, item, {
        new: true,
      });
    }

    public async findOneByEmail(email: string): Promise<Subscription> {
        return this.subscriptionModel.findOne({
          email,
          'deleted.status': false,
        });
      }

  public async deleteOne(subscription: Subscription, loggedUser: string): Promise<Subscription> {
      subscription.deleted = {
        by: loggedUser,
        date: new Date(),
        status: true,
      };
      return this.subscriptionModel.findByIdAndUpdate(subscription._id, subscription, {
        new: true,
      });
    }
}
