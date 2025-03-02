import { SubscriptionEnum } from "../enums/subscription.enum";
import { Project } from "../schemas/project.schema";
import { Subscription } from "../schemas/subscription.schema";
import { CategoryModel } from "./category.model";

export class SubscriptionModel {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  comment: string;
  status: SubscriptionEnum;

  constructor(item: Subscription) {
    this._id = item._id;
    this.firstname = item.firstname;
    this.lastname = item.lastname;
    this.status = item.status;
    this.comment = item.comment;
    this.email = item.email;
  }
}
