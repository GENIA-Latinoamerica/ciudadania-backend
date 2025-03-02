import { Injectable, Logger } from '@nestjs/common';
import { FileRepository } from './file.repository';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';
import { NotFoundError } from '@app/api-commons/errors/not-found.error';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { PaginationResponse } from '@app/api-commons/models/pagination-response.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { BusinessError } from '@app/api-commons/errors/business.error';
import { Token } from 'apps/api-auth/src/schemas/token.schema';
import { UserService } from '../user/user.service';
import { FileUploadUtils } from '@app/api-commons/utils/file-upload.utils';
import { S3Entity } from '@app/api-commons/dtos/s3-item.dto';
import { File } from '@app/api-commons/schemas/file.schema';
import { Project } from '@app/api-commons/schemas/project.schema';
import { ProjectRepository } from '../project/project.repository';

@Injectable()
export class FileService {
  private logger = null;
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly userService: UserService,
    private readonly projectRepository: ProjectRepository,
    private readonly fileUploadUtils: FileUploadUtils) {
    this.logger = new Logger(FileService.name);
  }

  healthCheck() {
    const message = `File Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async findById(id: string): Promise<File> {
    const file = await this.fileRepository.findOneById(id);
    if (!file) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    return file;
  }

  async create(token: Token, projectId: string, file: Express.Multer.File): Promise<File> {
    if (!file)
      throw new BusinessError(CommonErrorsEnum.INVALID_FILE);
    const loggedUser = await this.userService.findById(token, token._id);
    if (
      !loggedUser.roles.includes(RoleEnum.Admin) &&
      (loggedUser.projects.filter( x=> x._id.toString() == projectId)).length == 0)
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    const fileExist = await this.fileRepository.findOneByNameAndProject(file.originalname, project);
    if (fileExist)
      throw new BusinessError(CommonErrorsEnum.DUPLICATED_FILE);
    
    let entity = new File();
    entity.name = file.originalname;
    entity.project = project;
    entity = await this.fileRepository.create(entity);

    const fileName = `${file.originalname}_${entity._id}`

    const result: S3Entity = await this.fileUploadUtils.upload(file, fileName);
    entity.path = result.Location;

    entity = await this.fileRepository.updateOne(entity);
    return entity;
  }

  async delete(token: Token, projectId: string, fileId: string): Promise<File> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (
      !loggedUser.roles.includes(RoleEnum.Admin) &&
      (loggedUser.projects.filter( x=> x._id.toString() == projectId)).length == 0)
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const project:Project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    const fileExist = await this.fileRepository.findOneById(fileId);
    if (!fileExist)
      throw new BusinessError(CommonErrorsEnum.NOT_FOUND);

    return await this.fileRepository.deleteOne(fileExist, loggedUser);
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

    const response = await this.fileRepository.findWithAnd(
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
