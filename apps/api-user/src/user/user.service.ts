import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserModel } from '@app/api-commons/models/user.model';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';
import { NotFoundError } from '@app/api-commons/errors/not-found.error';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { PaginationResponse } from '@app/api-commons/models/pagination-response.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { BusinessError } from '@app/api-commons/errors/business.error';
import { Token } from 'apps/api-auth/src/schemas/token.schema';
import { User } from '@app/api-commons/schemas/user.schema';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { StringUtils } from '@app/api-commons/utils/string.utils';
import { Password } from '@app/api-commons/utils/password';
import { ForbiddenError } from '@app/api-commons/errors/forbidden.error';
import { ProjectModel } from '@app/api-commons/models/project.model';
import { Project } from '@app/api-commons/schemas/project.schema';
import { RandomStringService } from './utils/random-string.service';

@Injectable()
export class UserService {
  private logger = null;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly randomStringService: RandomStringService
  ) {
    this.logger = new Logger(UserService.name);
  }

  healthCheck() {
    const message = `User Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async findById(token: Token, id: string): Promise<UserModel> {
    const loggedUser = await this.userRepository.findOneById(token._id);
    if (!loggedUser || (id != token._id && !loggedUser.roles.includes(RoleEnum.Admin)))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    let user = null;
    if(loggedUser.roles.includes(RoleEnum.Admin))
      user = await this.userRepository.findOneByIdForChangePassword(id);
    else
      user = await this.userRepository.findOneById(id);
    if (!user) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    return new UserModel(user);
  }

  async findByIdInternal(id: string): Promise<UserModel> {
    const user = await this.userRepository.findOneByIdForChangePassword(id);
    if (!user) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    return new UserModel(user);
  }

  async updateOne(token: Token, user: UserModel): Promise<UserModel> {
    const loggedUser = await this.userRepository.findOneById(token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    let userExist = null;
    if(loggedUser.roles.includes(RoleEnum.Admin))
      userExist = await this.userRepository.findOneByIdForChangePassword(user._id);
    else
      userExist = await this.userRepository.findOneById(user._id);
    if (!userExist) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);

    userExist.email = user.email;
    userExist.lastname = user.lastname;
    userExist.firstname = user.firstname;

    userExist.projects = await user.projects.map( (x: ProjectModel) => {
      const project = new Project();
      project._id = x._id;
      return project;
    });
    
    return new UserModel(await this.userRepository.updateOne(userExist));
  }
  

  async findAll(data: PaginationRequest): Promise<PaginationResponse> {
    if (!data.quantity) data.quantity = 50;
    if (!data.order) data.order = 'ASC';
    if (!data.key) data.key = 'lastname';
    if (!data.page) data.page = 1;
    const response = await this.userRepository.find(
      data,
      [
        { lastname: new RegExp(data.search, 'i') },
        { email: new RegExp(data.search, 'i') },
        { firstname: new RegExp(data.search, 'i') },
      ],
      [],
      undefined,
    );
    return response;
  }

  async create(
      data: CreateUserRequestDto,
      password?: string
    ): Promise<UserModel> {
      let userAlreadyExist = await this.userRepository.findOneByEmail(data.email);
      if (userAlreadyExist) throw new ForbiddenError(CommonErrorsEnum.EMAIL_ALREADY_EXIST);
      let user = new User();
      user.firstname = data.firstname;
      user.lastname = data.lastname;
      user.email = StringUtils.emailNormalize(data.email);

      if (!password)
        password = this.randomStringService.generateRandomStringMath();
      user.password = await Password.toHash(password);
      user.must_complete = false;
      user.must_change_password = false; //TODO
      user.roles = [RoleEnum.Client]
      return new UserModel(await this.userRepository.create(user));
    }

    async delete(token: Token, user: string): Promise<UserModel> {
      const loggedUser = await this.userRepository.findOneById(token._id);
      if (!loggedUser.roles.includes(RoleEnum.Admin))
        throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
      const userExist = await this.userRepository.findOneByIdForChangePassword(user);
      if (!userExist) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
  
      return new UserModel(await this.userRepository.deleteOne(userExist, loggedUser._id));
    }
}
