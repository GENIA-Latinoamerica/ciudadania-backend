import { Injectable, Logger } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
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
import { Category } from '@app/api-commons/schemas/category.schema';
import { CategoryModel } from '@app/api-commons/models/category.model';
import { Project } from '@app/api-commons/schemas/project.schema';
import { ProjectRepository } from '../project/project.repository';

@Injectable()
export class CategoryService {
  private logger = null;
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userService: UserService,
    private readonly fileUploadUtils: FileUploadUtils) {
    this.logger = new Logger(CategoryService.name);
  }

  healthCheck() {
    const message = `Category Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async findById(token: Token, id: string): Promise<CategoryModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    const category = await this.categoryRepository.findOneById(id);
    if (!category) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    
    return new CategoryModel(category, await this.projectRepository.findAllByCategory(category._id));
  }

  async create(token: Token, name: string, file: Express.Multer.File): Promise<CategoryModel> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    const category = await this.categoryRepository.findOneByName(name);
    if (category)
      throw new BusinessError(CommonErrorsEnum.DUPLICATED_NAME);
    
    let entity = new Category();
    entity.name = name;
    entity = await this.categoryRepository.create(entity);

    const fileName = `${name}_${entity._id}`

    const result: S3Entity = await this.fileUploadUtils.upload(file, fileName);
    entity.image = result.Location;

    entity = await this.categoryRepository.updateOne(entity);
    return new CategoryModel(entity);
  }

  async update(token: Token, item: CategoryModel): Promise<Category> {
    const loggedUser = await this.userService.findById(token, token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    const entity = await this.categoryRepository.findOneByName(item.name);
    if (!entity)
      throw new BusinessError(CommonErrorsEnum.NOT_FOUND);
    entity.image = item.image;
    entity.name = item.name;
    return await this.categoryRepository.updateOne(entity);
  }

  async findAll(data: PaginationRequest): Promise<PaginationResponse> {
    if (!data.quantity) data.quantity = 50;
    if (!data.order) data.order = 'ASC';
    if (!data.key) data.key = 'name';
    if (!data.page) data.page = 1;
    const response = await this.categoryRepository.find(
      data,
      [
        { lastname: new RegExp(data.search, 'i') },
        { email: new RegExp(data.search, 'i') },
        { firstname: new RegExp(data.search, 'i') },
      ],
      [],
      undefined,
    );
    response.items = await Promise.all(response.items.map(async (x: Category) => new CategoryModel(x, await this.projectRepository.findAllByCategory(x._id)))); 
    return response;
  }
}
