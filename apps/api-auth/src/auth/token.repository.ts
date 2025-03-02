import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../schemas/token.schema';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  create(token: Token) {
    return this.tokenModel.create(token);
  }

  async findAndInvalidateToken(_id: string) {
    this.tokenModel
      .findOneAndUpdate({
        user: _id,
        valid: true,
      }, {
        valid: false
      }, {
        new: true,
        sort: { _id: -1 }
      })
      .exec();
  }

  async findLastToken(_id: string): Promise<Token> {
    const token: Token = await this.tokenModel
      .findOne({
        user: _id,
      })
      .sort({ _id: -1 })
      .exec();
    return token.valid ? token : undefined;
  }
}
