import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  Req,
  Query,
  Post,
  UploadedFile,
  Body,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { FileSizeValidationPipe } from '@app/api-commons/pipes/file-size-validation.pipe';
import { UserDto } from '@app/api-commons/dtos/user.dto';
import { CategoryDto } from '@app/api-commons/dtos/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller({ version: '1', path: 'category' })
export class CategoryController {
  companiesService: any;
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
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
    const response = await this.categoryService.findAll(data);
    response.items = response.items.map((x) => new CategoryDto(x));
    res.status(HttpStatus.OK).json(response);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const response = await this.categoryService.findById(req.token, id);
    return res.status(HttpStatus.OK).json(new CategoryDto(response));
  }

  @Post()
  async create(
    @Res() res: Response,
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
    @Req() req: any,
    @Body() body: CreateCategoryDto,
  ) {
    const response = await this.categoryService.create(req.token, body.name, file);
    res.status(HttpStatus.OK).json(new CategoryDto(response));
    return res;
  }
}

