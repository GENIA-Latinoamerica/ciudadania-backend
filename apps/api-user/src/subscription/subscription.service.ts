import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';
import { NotFoundError } from '@app/api-commons/errors/not-found.error';
import { PaginationRequest } from '@app/api-commons/models/pagination-request.model';
import { PaginationResponse } from '@app/api-commons/models/pagination-response.model';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { BusinessError } from '@app/api-commons/errors/business.error';
import { Token } from 'apps/api-auth/src/schemas/token.schema';
import { Subscription } from '@app/api-commons/schemas/subscription.schema';
import { CreateSubscriptionRequestDto } from './dto/create-subscription.dto';
import { StringUtils } from '@app/api-commons/utils/string.utils';
import { Password } from '@app/api-commons/utils/password';
import { ForbiddenError } from '@app/api-commons/errors/forbidden.error';
import { ProjectModel } from '@app/api-commons/models/project.model';
import { Project } from '@app/api-commons/schemas/project.schema';
import { SubscriptionModel } from '@app/api-commons/models/subscription.model';
import { SubscriptionEnum } from '@app/api-commons/enums/subscription.enum';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { CreateUserRequestDto } from '../user/dto/create-user.dto';
import { ApiNotificationClient } from '@app/api-commons/api-clients/internal-clients/notification';
import { RandomStringService } from '../user/utils/random-string.service';

@Injectable()
export class SubscriptionService {
  private logger = null;
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userService: UserService,
    private readonly apiNotificationClient: ApiNotificationClient,
    private readonly randomStringService: RandomStringService,
    private readonly userRepository: UserRepository,
  ) {
    this.logger = new Logger(SubscriptionService.name);
  }

  healthCheck() {
    const message = `Subscription Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async findById(token: Token, id: string): Promise<SubscriptionModel> {
    const loggedUser = await this.userRepository.findOneById(token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    const subscription = await this.subscriptionRepository.findOneById(id);
      
    if (!subscription) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);
    return new SubscriptionModel(subscription);
  }

  async updateOne(token: Token, id: string, status: SubscriptionEnum): Promise<SubscriptionModel> {
    const loggedUser = await this.userRepository.findOneById(token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);

    const subscriptionExist = await this.subscriptionRepository.findOneById(id);
    if (!subscriptionExist) throw new NotFoundError(CommonErrorsEnum.NOT_FOUND);

    subscriptionExist.status = status;

    if (status == SubscriptionEnum.ACCEPTED) {
      const dto = new CreateUserRequestDto();
      dto.email = subscriptionExist.email;
      dto.firstname = subscriptionExist.firstname;
      dto.lastname = subscriptionExist.lastname;

      const password = this.randomStringService.generateRandomStringMath();

      const userDto =  await this.userService.create(dto, password);

      const user = await this.userRepository.findOneByIdForChangePassword(userDto._id);
      this.apiNotificationClient.createUser(user._id, password);
      
      subscriptionExist.user = user;
    }
    
    return new SubscriptionModel(await this.subscriptionRepository.updateOne(loggedUser._id, subscriptionExist));
  }
  

  async findAll(token: Token, data: PaginationRequest): Promise<PaginationResponse> {
    const loggedUser = await this.userRepository.findOneById(token._id);
    if (!loggedUser.roles.includes(RoleEnum.Admin))
      throw new BusinessError(CommonErrorsEnum.FORBIDDEN);
    if (!data.quantity) data.quantity = 50;
    if (!data.order) data.order = 'DESC';
    if (!data.key) data.key = '_id';
    if (!data.page) data.page = 1;
    const response = await this.subscriptionRepository.find(
      data,
      [
        { lastname: new RegExp(data.search, 'i') },
        { email: new RegExp(data.search, 'i') },
        { firstname: new RegExp(data.search, 'i') },
        { comment: new RegExp(data.search, 'i') },
      ],
      [],
      undefined,
    );
    return response;
  }

  async create(
      data: CreateSubscriptionRequestDto,
    ): Promise<SubscriptionModel> {
      let subscriptionAlreadyExist = await this.subscriptionRepository.findOneByEmail(data.email);
      if (subscriptionAlreadyExist) throw new ForbiddenError(CommonErrorsEnum.EMAIL_ALREADY_EXIST);
      let subscription = new Subscription();
      subscription.firstname = data.firstname;
      subscription.lastname = data.lastname;
      subscription.email = StringUtils.emailNormalize(data.email);
      subscription.comment = data.comment;
      subscription.status = SubscriptionEnum.PENDING;
      return new SubscriptionModel(await this.subscriptionRepository.create(subscription));
    }
}
