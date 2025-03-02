import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos/login-request.dto';
import { LoginResponseModel } from '../models/login-response.model';
import { Response } from 'express';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { SignUpRequestDto } from '../dtos/singup-request.dto';
import { UserDto } from '@app/api-commons/dtos/user.dto';
import { UserModel } from '@app/api-commons/models/user.model';
import { TokenDto } from '@app/api-commons/dtos/token.dto';
import { ValidateResponseModel } from '../models/validate-response.model';
import { ValidateResponseDto } from '../dtos/validate-response.dto';
import { RoleEnum } from '@app/api-commons/enums/role.enum';
import { Roles } from '@app/api-commons/decorators/roles.decorator';
import { UserLoginMethodResponseDto } from '../dtos/login-method-response.dto';
import { ResetPasswordRequestDto } from '../dtos/reset-password-request.dto';
import { ChangePasswordRequestDto } from '../dtos/change-password-request.dto copy';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  healthCheck() {
    return this.authService.healthCheck();
  }

  @Get('/check-email/:email')
  async checkemail(@Param('email') email: string): Promise<UserLoginMethodResponseDto> {
    return await this.authService.checkUserSignMethod(email);
  }

  @Post('/login')
  async create(@Body() item: LoginDto, @Res() res: Response) {
    const loginResponse: LoginResponseModel = await this.authService.doLogin(
      item.email,
      item.password,
    );
    return res
      .status(HttpStatus.OK)
      .json(
        new LoginResponseDto(
          loginResponse.user,
          loginResponse.jwt,
          loginResponse.must_complete,
        ),
      );
  }

  @Post('/change-password')
  async changePassword(@Req() req: any, @Body() item: ChangePasswordRequestDto, @Res() res: Response) {
    const user = await this.authService.changePassword(
      req.token,
      item.password,
      item.newPassword,
    );
    return res
      .status(HttpStatus.OK).json(new UserDto(user));
  }

  @Post('/signup')
  async signup(
    @Req() req: any,
    @Body() item: SignUpRequestDto,
    @Res() res: Response,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const response: LoginResponseModel = await this.authService.signup(
      ip,
      item,
    );
    return res.status(HttpStatus.OK).json(new LoginResponseDto(
      response.user,
      response.jwt,
      response.must_complete,
    ),);
  }

  @Post('/complete_profile')
  @Roles(RoleEnum.Client)
  async completeProfile(
    @Req() req: any,
    @Body() item: SignUpRequestDto,
    @Res() res: Response,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const response: UserModel = await this.authService.createUser(
      ip,
      req.token,
      item,
    );
    return res.status(HttpStatus.OK).json(new UserDto(response));
  }

  @Post('/logout')
  async logout(
    @Req() req: any,
    @Res() res: Response,
  ) {
    this.authService.logout(
      req.token,
    );
    return res.status(HttpStatus.OK).json();
  }

  @Get('/validate')
  async validate(@Req() req: any, @Res() res: Response) {
    const response: ValidateResponseModel = await this.authService.validate(
      req.token,
    );
    return res
      .status(HttpStatus.OK)
      .json(new ValidateResponseDto(response.user, response.must_complete));
  }

  @Post('/reset-password')
  async resetPassword(@Req() req: any, @Res() res: Response,
  @Body() item: ResetPasswordRequestDto,) {
    await this.authService.resetPassword(
      item.code,
      item.password,
    );
    return res
      .status(HttpStatus.OK)
      .json();
  }

  @Get('/request-reset-password/:email')
  async requestResetPassword(@Req() req: any, @Res() res: Response,
  @Param('email') email: string) {
    await this.authService.requestResetPassword(
      email,
    );
    return res
      .status(HttpStatus.OK)
      .json();
  }

  @Get('/verify')
  async verifyToken(@Req() req: any, @Res() res: Response) {
    return res.status(HttpStatus.OK).json(req.token);
  }

  @Get('/pme_token')
  @Roles(RoleEnum.Client)
  async getPmeToken(@Req() req: any, @Res() res: Response) {
    const item = await this.authService.getPMEToken(req.token);
    return res.status(HttpStatus.OK).json(new TokenDto(item));
  }
}
