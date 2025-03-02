import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  Req,
  Query,
  Post,
  Body,
  Delete,
  Put,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Response } from 'express';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { CreateSubscriptionRequestDto } from './dto/create-subscription.dto';
import { SubscriptionDto } from '@app/api-commons/dtos/subscription.dto';
import { SubscriptionModel } from '@app/api-commons/models/subscription.model';
import { UpdateSubscriptionRequestDto } from './dto/update-subscription.dto';

@Controller({ version: '1', path: 'subscription' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get()
  @Roles(RoleEnum.Admin)
  async getPayments(@Res() res: Response, @Query() params: any, @Req() req: any) {
    const data: PaginationRequest = {
      page: params.page,
      quantity: params.quantity,
      order: params.order,
      key: params.key,
      search: params.search,
      filter: params.filter,
      date_from: params.date_from,
      date_to: params.date_to,
    };
    const response = await this.subscriptionService.findAll(req.token, data);
    response.items = response.items.map((x) => new SubscriptionDto(x));
    res.status(HttpStatus.OK).json(response);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin)
  async get(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const response = await this.subscriptionService.findById(req.token, id);
    return res.status(HttpStatus.OK).json(new SubscriptionDto(response));
  }

  @Post()
    async create(
      @Body() item: CreateSubscriptionRequestDto,
      @Res() res: Response,
    ) {
      const response: SubscriptionModel = await this.subscriptionService.create(
        item,
      );
      return res.status(HttpStatus.OK).json(new SubscriptionDto(
        response
      ),);
    }

    @Put(':id')
    @Roles(RoleEnum.Admin)
      async delete(
        @Res() res: Response,
        @Req() req: any,
        @Body() item: UpdateSubscriptionRequestDto,
        @Param('id') id: string
      ) {
        const response = await this.subscriptionService.updateOne(req.token, id, item.status);
        res.status(HttpStatus.OK).json(new SubscriptionDto(response));
        return res;
      }
}
