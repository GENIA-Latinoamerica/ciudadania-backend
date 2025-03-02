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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from '@app/api-commons/dtos/user.dto';
import { Response } from 'express';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { UserModel } from '@app/api-commons/models/user.model';

@Controller({ version: '1', path: 'user' })
export class UserController {
  paymentsService: any;
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles(RoleEnum.Admin)
  async getPayments(@Res() res: Response, @Query() params: any) {
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
    const response = await this.userService.findAll(data);
    response.items = response.items.map((x) => new UserDto(x));
    res.status(HttpStatus.OK).json(response);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin)
  async get(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const response = await this.userService.findById(req.token, id);
    return res.status(HttpStatus.OK).json(new UserDto(response));
  }

  @Get('internal/:id')
  async getInternal(@Param('id') id: string, @Res() res: Response) {
    const response = await this.userService.findByIdInternal(id);
    return res.status(HttpStatus.OK).json(new UserDto(response));
  }

  @Post('/create')
  @Roles(RoleEnum.Admin)
    async create(
      @Req() req: any,
      @Body() item: CreateUserRequestDto,
      @Res() res: Response,
    ) {
      const response: UserModel = await this.userService.create(
        item,
      );
      return res.status(HttpStatus.OK).json(new UserDto(
        response
      ),);
    }

    @Delete(':id')
    @Roles(RoleEnum.Admin)
      async delete(
        @Res() res: Response,
        @Req() req: any,
        @Param('id') id: string
      ) {
        const response = await this.userService.delete(req.token, id);
        res.status(HttpStatus.OK).json(new UserDto(response));
        return res;
      }
}
