import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../models/pagination-response.model';
import { PaginationRequest } from '../models/pagination-request.model';
import { ObjectId } from 'mongoose';

@Injectable()
export class BaseRepository {
  protected model = null;
  protected userModel = null;

  constructor(model: any, userModel?: any) {
    this.model = model;
    this.userModel = userModel;
  }

  isJson(value: string) {
    if (!value || value.length == 0) return false;
    try {
      return value
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map((x) => JSON.parse(x));
    } catch (error) {
      return undefined;
    }
  }

  async find(
    data: PaginationRequest,
    or: any,
    populate: any,
    baseFilter?: { [key: string]: string | ObjectId | boolean },
  ): Promise<PaginationResponse> {
    const key = data.key;
    const order = data.order == 'ASC' ? 1 : -1;

    const filter = await this.getFilter(data, or, undefined, baseFilter);
    const items = await this.model
      .find(
        data.search && data.search.length > 0
          ? {
              $and: filter
                ? filter
                : [{ 'deleted.status': false }, { $or: or }],
            }
          : {
              $and: filter ? filter : [{ 'deleted.status': false }],
            },
      )
      .populate(populate)
      .limit(data.quantity)
      .skip((data.page - 1) * data.quantity)
      .sort({ [key]: order })
      .exec();

    const total = await this.count(data, filter, or);
    const pageResponse: PaginationResponse = {
      current_page: data.page,
      items: items,
      total_items: total,
      request: data,
      response: [],
      total_pages: data.quantity ? Math.ceil(total / data.quantity) : 1,
    };

    return Promise.resolve(pageResponse);
  }

  async findWithAnd(
    data: PaginationRequest,
    and: any[],
    or: any,
    populate: any,
  ): Promise<PaginationResponse> {
    const key = data.key;
    const order = data.order == 'ASC' ? 1 : -1;

    let filter = await this.getFilter(data, or, undefined, undefined);
    for (const condition of and) {
      if (!filter) filter = [];
      filter.push(condition);
    }
    const items = await this.model
      .find(
        data.search && data.search.length > 0
          ? {
              $and: filter
                ? filter
                : [{ 'deleted.status': false }, { $or: or }],
            }
          : {
              $and: filter ? filter : [{ 'deleted.status': false }],
            },
      )
      .populate(populate)
      .limit(data.quantity)
      .skip((data.page - 1) * data.quantity)
      .sort({ [key]: order })
      .exec();
    const total = await this.count(data, filter, or);
    const pageResponse: PaginationResponse = {
      current_page: data.page,
      items: items,
      total_items: total,
      request: data,
      response: [],
      total_pages: data.quantity ? Math.ceil(total / data.quantity) : 1,
    };

    return Promise.resolve(pageResponse);
  }

  async getFilter(
    data: PaginationRequest,
    or: any,
    user: string,
    baseFilter?: { [key: string]: string | ObjectId | boolean },
  ): Promise<any> {
    let filter = this.isJson(data.filter);
    if (data.date_from || data.date_to) {
      if (!filter) filter = [];
      data.date_from && data.date_to
        ? filter.push({
            date: {
              $gte: new Date(data.date_from),
              $lt: new Date(data.date_to),
            },
          })
        : data.date_from
          ? filter.push({
              date: {
                $gte: new Date(data.date_from),
              },
            })
          : filter.push({
              date: {
                $lt: new Date(data.date_to),
              },
            });
    }
    if (user) {
      if (!filter) filter = [];
      filter.push({ user: await this.userModel.findById(user) });
    }
    if (baseFilter) {
      if (!filter) filter = [];
      filter.push(baseFilter);
    }
    if (data.search) {
      if (!filter) filter = [];
      filter.push({ $or: or });
    }
    if (!filter) filter = [];
    filter.push({ 'deleted.status': false });
    return filter;
  }

  async count(data: PaginationRequest, filter: any, or: any) {
    return this.model.countDocuments(
      data.search
        ? {
            $and: filter ? filter : [{ 'deleted.status': false }, { $or: or }],
          }
        : {
            $and: filter ? filter : [{ 'deleted.status': false }],
          },
    );
  }
}
