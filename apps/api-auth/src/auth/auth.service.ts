import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from 'apps/api-user/src/user/user.repository';
import { Token } from '../schemas/token.schema';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from './token.repository';
import { LoginResponseModel } from '../models/login-response.model';
import { AuthErrorsEnum } from '../enums/auth-errors.enum';
import { NotFoundError } from '@app/api-commons/errors/not-found.error';
import { SignUpRequestDto } from '../dtos/singup-request.dto';
import { UserModel } from '@app/api-commons/models/user.model';
import { User } from '@app/api-commons/schemas/user.schema';
import { IToken } from '@app/api-commons/interfaces/token.interface';
import { TokenModel } from '@app/api-commons/models/token.model';
import { ValidateResponseModel } from '../models/validate-response.model';
import { Password } from '../utils/password';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { UserLoginMethodResponseDto } from '../dtos/login-method-response.dto';
import { StringUtils } from '@app/api-commons/utils/string.utils';
import { RandomStringService } from 'apps/api-user/src/user/utils/random-string.service';
import { ResetCode } from '@app/api-commons/schemas/reset-code.schema';
import { ApiNotificationClient } from '@app/api-commons/api-clients/internal-clients/notification';

@Injectable()
export class AuthService {
  private logger = null;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private jwtService: JwtService,
    private readonly randomStringService: RandomStringService,
    private readonly apiNotificationClient: ApiNotificationClient,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  healthCheck() {
    const message = `Auth Endpoint Working!`;
    this.logger.log(message);
    return message;
  }

  async changePassword(token: Token, currentPassword: string, newPassword: string): Promise<UserModel> {
    const loggedUser = await this.userRepository.findOneByIdForChangePassword(token._id);

    if (!await Password.compare(loggedUser.password, currentPassword))
      throw new NotFoundError(AuthErrorsEnum.INVALID_LOGIN_DATA);
    loggedUser.password = await Password.toHash(newPassword);
    loggedUser.must_change_password = false;
    return new UserModel(await this.userRepository.updateOne(loggedUser));
  }

  async requestResetPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOneByEmail(email);
    if (user) {
      user.reset_code = await this.generateResetCode();
      //Send Email
      await this.userRepository.updateOne(user);
      console.log(user);
      this.apiNotificationClient.resetPassword(user._id, user.reset_code.code);
    }
    return;
  }

  async resetPassword(
    code: string,
    password: string,
  ): Promise<undefined> {
    const user = await this.userRepository.validateResetCode(code);
    if (!user) 
      throw new NotFoundError(AuthErrorsEnum.INVALID_CODE);
    user.reset_code.valid = false;
    user.password = await Password.toHash(password);

    this.userRepository.updateOne(user);
    return;
  }

  async generateResetCode(): Promise<ResetCode>{
    let item = undefined;
    let number = undefined;
    let first = true;
    while (first || item) {
      first = false;
      number = this.randomStringService.generateRandomNumberMath(6);
      item = await this.userRepository.findOneByResetCode(number);
    }
    const resetCode = new ResetCode();
    resetCode.code = number;
    resetCode.date = new Date();
    resetCode.due_date = new Date(resetCode.date.getTime() + 5*60000);
    resetCode.valid = true;
    return resetCode;
  }

  async doLogin(
    email: string,
    password: string,
  ): Promise<LoginResponseModel> {
    const user = await this.userRepository.findOneByEmail(StringUtils.emailNormalize(email));
    if (user) {
      if (
        (await Password.compare(user.password, password))
      ) {
        const jwtSign = this.jwtService.sign(
          {
            _id: user._id,
            email: user.email,
            roles: user.roles,
          },
          { secret: process.env.SECURITY_JWT },
        );

        const tokenModel = new Token();
        tokenModel.jwt = jwtSign;
        tokenModel.user = user._id;
        tokenModel.valid = true;
        tokenModel.date = new Date(Date.now());
        await this.tokenRepository.create(tokenModel);
        return new LoginResponseModel(new UserModel(user), jwtSign, user.must_complete);
      }
    }
    throw new NotFoundError(AuthErrorsEnum.INVALID_LOGIN_DATA);
  }

  async signup(
    ip: string,
    data: SignUpRequestDto,
  ): Promise<LoginResponseModel> {
    let userAlreadyExist = await this.userRepository.findOneByEmail(data.email);
    if (userAlreadyExist) throw new NotFoundError(AuthErrorsEnum.EMAIL_ALREADY_EXIST);
    let user = new User();
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.email = StringUtils.emailNormalize(data.email);
    user.password = await Password.toHash(data.password);
    user.must_complete = false;
    user.roles = [RoleEnum.Client]
    user = await this.userRepository.create(user);
    const jwtSign = this.jwtService.sign(
      {
        _id: user._id,
        email: user.email,
        roles: user.roles,
      },
      { secret: process.env.SECURITY_JWT },
    );

    const tokenModel = new Token();
    tokenModel.jwt = jwtSign;
    tokenModel.user = user._id;
    tokenModel.valid = true;
    tokenModel.date = new Date(Date.now());
    await this.tokenRepository.create(tokenModel);

    return new LoginResponseModel(new UserModel(user), jwtSign, user.must_complete);
  }

  async createUser(
    ip: string,
    token: IToken,
    data: SignUpRequestDto,
  ): Promise<UserModel> {
    let user = await this.userRepository.findOneToComplete(token._id);
    if (!user)
      throw new NotFoundError(AuthErrorsEnum.USER_NOT_AVAILABLE_TO_COMPLETE);
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.email = StringUtils.emailNormalize(data.email);
    user.must_complete = false;
    user = await this.userRepository.updateOne(user);

    return new UserModel(user);
  }

  async logout(
    token: IToken,
  ) {
    this.tokenRepository.findAndInvalidateToken(token._id);
  }

  async validate(token: IToken): Promise<ValidateResponseModel> {
    const userToken = await this.tokenRepository.findLastToken(token._id);
    if (!userToken) throw new NotFoundError(AuthErrorsEnum.TOKEN_NOT_VALID);
    const user = await this.userRepository.findOneById(token._id);
    if (!!user) return new ValidateResponseModel(new UserModel(user), user.must_complete);
    throw new NotFoundError(AuthErrorsEnum.NOT_AUTHORIZED);
  }

  async getPMEToken(token: IToken): Promise<TokenModel> {
    const item = await this.tokenRepository.findLastToken(token._id);
    if (!!item) return item;
    throw new NotFoundError(AuthErrorsEnum.NOT_AUTHORIZED);
  }

  async checkIfEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneByEmail(email);
    return Promise.resolve(!!user);
  }

  async checkUserSignMethod(_email: string): Promise<UserLoginMethodResponseDto> {
    const user = await this.userRepository.findOneByEmail(StringUtils.emailNormalize(_email));
    const response: UserLoginMethodResponseDto = new UserLoginMethodResponseDto();
    response.userExist = false;
    if (user) {
      response.userExist = true;
      response.signMethod = 'user-password';
    }
    return response;
  }

}
