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
import { FileService } from './file.service';
import { Response } from 'express';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { FileSizeValidationPipe } from '@app/api-commons/pipes/file-size-validation.pipe';
import { FileDto } from '@app/api-commons/dtos/file.dto';

@Controller({ version: '1', path: 'project/:projectId/file' })
export class FileController {
  companiesService: any;
  constructor(private readonly fileService: FileService) {}
  @Get()
  async getPayments(@Res() res: Response, @Query() params: any, @Param('projectId') projectId: string, @Req() req: any) {
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
    const response = await this.fileService.findAll(req.token, projectId, data);
    response.items = response.items.map((x) => new FileDto(x));
    res.status(HttpStatus.OK).json(response);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin)
  async get(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const response = await this.fileService.findById(id);
    return res.status(HttpStatus.OK).json(new FileDto(response));
  }

  @Post()
  async create(
    @Res() res: Response,
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
    @Param('projectId') projectId: string,
    @Req() req: any,
  ) {
    const response = await this.fileService.create(req.token, projectId, file);
    res.status(HttpStatus.OK).json(new FileDto(response));
    return res;
  }

  @Delete(':fileId')
  async delete(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Param('fileId') fileId: string,
    @Req() req: any,
  ) {
    const response = await this.fileService.delete(req.token, projectId, fileId);
    res.status(HttpStatus.OK).json(new FileDto(response));
    return res;
  }
}

