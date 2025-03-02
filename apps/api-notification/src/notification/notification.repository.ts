import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification, NotificationDocument } from "./schemas/notification.schema";
import { BaseRepository } from "@app/api-commons/repository/base.repository";
import { NotificationStatusEnum } from "@app/api-commons/enums/notification-status.enum";
import { Deleted } from "@app/api-commons/schemas/deleted.schema";

@Injectable()
export class NotificationRepository extends BaseRepository {
  constructor(
    @InjectModel(Notification.name) readonly notificationModel: Model<NotificationDocument>
  ) {
    super(notificationModel)
  }

  public async create(user: Notification): Promise<Notification> {
      user.created = {
        by: user._id,
        date: new Date(),
      };
      user.deleted = new Deleted();
      return this.notificationModel.create(user);
    }

  async updateOne(item: Notification): Promise<Notification> {
      item.updated = {
        by: item._id,
        date: new Date(),
      };
      return this.notificationModel.findByIdAndUpdate(item._id, item, {
        new: true,
      });
    }

}