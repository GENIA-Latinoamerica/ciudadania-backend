import { IToken } from '@app/api-commons/interfaces/token.interface';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../schemas/token.schema';
import { TokenRepository } from './token.repository';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async verifyToken(authHeader: string): Promise<IToken> {
    const claims: IToken = await this.jwtService.verify(authHeader, {
      secret: process.env.SECURITY_JWT,
    });
    claims.jwt = authHeader;
    return claims;
  }

  async findLastToken(_id: string): Promise<Token> {
    return await this.tokenRepository.findLastToken(_id);
  }
}
