import { Injectable, Logger } from '@nestjs/common';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';
import { NotFoundError } from '@app/api-commons/errors/not-found.error';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { PaginationResponse } from '@app/api-commons/models/pagination-response.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { BusinessError } from '@app/api-commons/errors/business.error';
import { Token } from 'apps/api-auth/src/schemas/token.schema';
import { UserService } from '../user/user.service';
import { S3Entity } from '@app/api-commons/dtos/s3-item.dto';

import { Project } from '@app/api-commons/schemas/project.schema';
import { ProjectRepository } from '../project/project.repository';
import { Note } from '@app/api-commons/schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteRepository } from './notes.repository';

@Injectable()
export class NotesService {
  private logger = null;
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly userService: UserService,
    private readonly projectRepository: ProjectRepository) {
    this.logger = new Logger(NotesService.name);
  }

  healthCheck() {
    const message = `Note Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async findById(id: string): Promise<Note> {
    const note = await this.noteRepository.findOneById(id);
    if (!note) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    return note;
  }

  async updateById(token: Token, projectId: string, id: string, item: CreateNoteDto): Promise<Note> {
    const note = await this.noteRepository.findOneById(id);
    if (!note) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);

    const loggedUser = await this.userService.findById(token, token._id);
    if (
      !loggedUser.roles.includes(RoleEnum.Admin) &&
      (loggedUser.projects.filter( x=> projectId.toString() == note.project._id)).length == 0)
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    if (note.title != item.title) {
      const noteExist = await this.noteRepository.findOneByTitleAndProject(item.title, note.project);
      if (noteExist)
        throw new BusinessError(CommonErrorsEnum.DUPLICATED_NAME);
    }

    note.title = item.title;
    note.content = item.content;
    return await this.noteRepository.updateOne(note);
  }

  async create(token: Token, projectId: string, note: CreateNoteDto): Promise<Note> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (
      !loggedUser.roles.includes(RoleEnum.Admin) &&
      (loggedUser.projects.filter( x=> x._id.toString() == projectId)).length == 0)
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    const noteExist = await this.noteRepository.findOneByTitleAndProject(note.title, project);
    if (noteExist)
      throw new BusinessError(CommonErrorsEnum.DUPLICATED_NAME);
    
    let entity = new Note();
    entity.title = note.title;
    entity.content = note.content;
    entity.project = project;
    return await this.noteRepository.create(entity);
  }

  async delete(token: Token, projectId: string, noteId: string): Promise<Note> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (
      !loggedUser.roles.includes(RoleEnum.Admin) &&
      (loggedUser.projects.filter( x=> x._id.toString() == projectId)).length == 0)
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const project:Project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    const noteExist = await this.noteRepository.findOneById(noteId);
    if (!noteExist)
      throw new BusinessError(CommonErrorsEnum.NOT_FOUND);

    return await this.noteRepository.deleteOne(noteExist, loggedUser);
  }

  async findAll(token: Token, projectId: string, data: PaginationRequest): Promise<PaginationResponse> {
    if (!data.quantity) data.quantity = 50;
    if (!data.order) data.order = 'ASC';
    if (!data.key) data.key = 'name';
    if (!data.page) data.page = 1;

    const project = await this.projectRepository.findOneById(projectId);
    if (!project) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);

    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin) &&
        !loggedUser.projects.find( x => x._id.toString() == project._id.toString()))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    const response = await this.noteRepository.findWithAnd(
      data,
      [
        {
          'project': projectId,
        }],
      [
        { lastname: new RegExp(data.search, 'i') },
        { email: new RegExp(data.search, 'i') },
        { firstname: new RegExp(data.search, 'i') },
      ],
      [],
    );
    return response;
  }
}
