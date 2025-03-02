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
import { Response } from 'express';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { NoteDto } from '@app/api-commons/dtos/note.dto';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller({ version: '1', path: 'project/:projectId/notes' })
export class NoteController {
  companiesService: any;
  constructor(private readonly noteService: NotesService) {}
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
    const response = await this.noteService.findAll(req.token, projectId, data);
    response.items = response.items.map((x) => new NoteDto(x));
    res.status(HttpStatus.OK).json(response);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin)
  async get(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const response = await this.noteService.findById(id);
    return res.status(HttpStatus.OK).json(new NoteDto(response));
  }

  @Post()
  async create(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Body() body: CreateNoteDto,
    @Req() req: any,
  ) {
    const response = await this.noteService.create(req.token, projectId, body);
    res.status(HttpStatus.OK).json(new NoteDto(response));
    return res;
  }

  @Put(':noteId')
  async edit(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Param('noteId') noteId: string,
    @Body() body: CreateNoteDto,
    @Req() req: any,
  ) {
    const response = await this.noteService.updateById(req.token, projectId, noteId, body);
    res.status(HttpStatus.OK).json(new NoteDto(response));
    return res;
  }

  @Delete(':id')
  async delete(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const response = await this.noteService.delete(req.token, projectId, id);
    res.status(HttpStatus.OK).json(new NoteDto(response));
    return res;
  }
}

