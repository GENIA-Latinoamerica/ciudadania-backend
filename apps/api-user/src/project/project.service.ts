import { Injectable, Logger } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';
import { NotFoundError } from '@app/api-commons/errors/not-found.error';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { PaginationResponse } from '@app/api-commons/models/pagination-response.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { BusinessError } from '@app/api-commons/errors/business.error';
import { Token } from 'apps/api-auth/src/schemas/token.schema';
import { UserService } from '../user/user.service';
import { Project } from '@app/api-commons/schemas/project.schema';
import { ProjectModel } from '@app/api-commons/models/project.model';
import { FileUploadUtils } from '@app/api-commons/utils/file-upload.utils';
import { S3Entity } from '@app/api-commons/dtos/s3-item.dto';
import { UserModel } from '@app/api-commons/models/user.model';
import { CategoryRepository } from '../category/category.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiNotificationClient } from '@app/api-commons/api-clients/internal-clients/notification';

@Injectable()
export class ProjectService {
  private logger = null;
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userService: UserService,
    private readonly apiNotificationClient: ApiNotificationClient,
    private readonly fileUploadUtils: FileUploadUtils) {
    this.logger = new Logger(ProjectService.name);
  }

  healthCheck() {
    const message = `Project Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async findById(token: Token, id: string): Promise<ProjectModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    
    const project = await this.projectRepository.findOneById(id);
    if (!project) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    
    if (!loggedUser.roles.includes(RoleEnum.Admin) &&
        !loggedUser.projects.find( x => x._id.toString() == project._id.toString()))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    
    return new ProjectModel(project);
  }

  async create(token: Token, item: CreateProjectDto, file: Express.Multer.File): Promise<ProjectModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    const project = await this.projectRepository.findOneByName(item.name);
    if (project)
      throw new BusinessError(CommonErrorsEnum.DUPLICATED_NAME);

    const category = await this.categoryRepository.findOneById(item.category);
    if (!category)
      throw new BusinessError(CommonErrorsEnum.NOT_FOUND);
    
    let entity = new Project();
    entity.name = item.name;
    entity.category = category;
    entity = await this.projectRepository.create(entity);

    const fileName = `${item.name}_${entity._id}`

    const result: S3Entity = await this.fileUploadUtils.upload(file, fileName);
    entity.image = result.Location;

    entity = await this.projectRepository.updateOne(entity, loggedUser._id);
    return new ProjectModel(entity);
  }

  async update(token: Token, id: string, item: CreateProjectDto, file: Express.Multer.File): Promise<ProjectModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    const entity = await this.projectRepository.findOneById(id);    
    if (!entity)
      throw new BusinessError(CommonErrorsEnum.NOT_FOUND);

    const category = await this.categoryRepository.findOneById(item.category);
    if (!category)
      throw new BusinessError(CommonErrorsEnum.NOT_FOUND);

    if (file) {
      const fileName = `${item.name}_${entity._id}`
      const result: S3Entity = await this.fileUploadUtils.upload(file, fileName);
      entity.image = result.Location;
    }
    entity.name = item.name;
    entity.category = category;
    return new ProjectModel(await this.projectRepository.updateOne(entity, loggedUser._id));;
  }


  async grantAccess(token: Token, projectId: string, userId: string): Promise<UserModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const user = await this.userService.findById(token, userId);
    console.log('user2', user);
    if (!user)
      throw new BusinessError(CommonErrorsEnum.INVALID_USER);
    const project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);
    if (user.projects.find( x => x._id.toString() == project._id.toString()))
      throw new BusinessError(CommonErrorsEnum.DUPLICATED_PROJECT);

    user.projects.push(new ProjectModel(project));
    return await this.userService.updateOne(token, user);
  }

  async deleteAccess(token: Token, projectId: string, userId: string): Promise<UserModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const user = await this.userService.findById(token, userId);
    if (!user)
      throw new BusinessError(CommonErrorsEnum.INVALID_USER);
    const project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);
    if (!user.projects.find( x => x._id.toString() == project._id.toString()))
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    user.projects.splice(user.projects.indexOf(new ProjectModel(project)), 1);
    return await this.userService.updateOne(token, user);
  }

  async delete(token: Token, projectId: string): Promise<ProjectModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser || !loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const project = await this.projectRepository.findOneById(projectId);
    if (!project)
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);
    if (!loggedUser.roles.includes(RoleEnum.Admin) && !loggedUser.projects.find( x => x._id.toString() == project._id.toString()))
      throw new BusinessError(CommonErrorsEnum.INVALID_PROJECT);

    return new ProjectModel(await this.projectRepository.deleteOne(project, loggedUser._id));
  }

  async findAll(data: PaginationRequest): Promise<PaginationResponse> {
    if (!data.quantity) data.quantity = 50;
    if (!data.order) data.order = 'ASC';
    if (!data.key) data.key = 'name';
    if (!data.page) data.page = 1;
    const response = await this.projectRepository.find(
      data,
      [
        { lastname: new RegExp(data.search, 'i') },
        { email: new RegExp(data.search, 'i') },
        { firstname: new RegExp(data.search, 'i') },
      ],
      ['category'],
      undefined,
    );
    return response;
  }
}
