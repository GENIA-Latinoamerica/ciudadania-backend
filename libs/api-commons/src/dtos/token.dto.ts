import { TokenModel } from '../models/token.model';
export class TokenDto {
  _id: string;
  pme_token: string;

  constructor(model: TokenModel) {
    this._id = model._id;
    this.pme_token = model.pme_token;
  }
}
