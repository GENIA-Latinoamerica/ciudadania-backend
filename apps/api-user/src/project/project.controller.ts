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
  Put,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Response } from 'express';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { ProjectDto } from '@app/api-commons/dtos/project.dto';
import { FileSizeValidationPipe } from '@app/api-commons/pipes/file-size-validation.pipe';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserDto } from '@app/api-commons/dtos/user.dto';

@Controller({ version: '1', path: 'project' })
export class ProjectController {
  companiesService: any;
  constructor(private readonly projectService: ProjectService) {}
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
    const response = await this.projectService.findAll(data);
    response.items = response.items.map((x) => new ProjectDto(x));
    res.status(HttpStatus.OK).json(response);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin)
  async get(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const response = await this.projectService.findById(req.token, id);
    return res.status(HttpStatus.OK).json(new ProjectDto(response));
  }

  @Post()
  async create(
    @Res() res: Response,
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
    @Req() req: any,
    @Body() body: CreateProjectDto,
  ) {
    const response = await this.projectService.create(req.token, body, file);
    res.status(HttpStatus.OK).json(new ProjectDto(response));
    return res;
  }

  @Put(':id')
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
    @Req() req: any,
    @Body() body: CreateProjectDto,
  ) {
    const response = await this.projectService.update(req.token, id, body, file);
    res.status(HttpStatus.OK).json(new ProjectDto(response));
    return res;
  }

  @Post(':id/access/:userId')
  async granAcess(
    @Res() res: Response,
    @Req() req: any,
    @Param('userId') userId: string,
    @Param('id') id: string
  ) {
    const response = await this.projectService.grantAccess(req.token, id, userId);
    res.status(HttpStatus.OK).json(new UserDto(response));
    return res;
  }

  @Delete(':id/access/:userId')
  async deleteAcess(
    @Res() res: Response,
    @Req() req: any,
    @Param('userId') userId: string,
    @Param('id') id: string
  ) {
    const response = await this.projectService.deleteAccess(req.token, id, userId);
    res.status(HttpStatus.OK).json(new UserDto(response));
    return res;
  }

  @Delete(':id')
  async delete(
    @Res() res: Response,
    @Req() req: any,
    @Param('id') id: string
  ) {
    const response = await this.projectService.delete(req.token, id);
    res.status(HttpStatus.OK).json(new ProjectDto(response));
    return res;
  }
}

