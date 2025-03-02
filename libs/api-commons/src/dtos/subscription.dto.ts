import { SubscriptionEnum } from '../enums/subscription.enum';
import { SubscriptionModel } from '../models/subscription.model';
export class SubscriptionDto {
  _id: string;
  firstname: string;
  email: string;
  lastname: string;
  comment: string;
  status: SubscriptionEnum;

  constructor(model: SubscriptionModel) {
    this._id = model._id;
    this.firstname = model.firstname;
    this.lastname = model.lastname;
    this.email = model.email;
    this.comment = model.comment;
    this.status = model.status;
    }
}
