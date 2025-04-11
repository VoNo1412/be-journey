
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * @tutorial How does jwt work?
 * @readonly JWT gồm 3 phần chính: Header, Payload, Signature 
      * @Header cách mã hóa
      * @Payload chứa data user (userId)
      * @Signature đảm bảo token chưa bị sửa và được tạo bởi server có secret
      * @SecretKey xác minh token có bị sửa đổi không.
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || 'defaultSecret'
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
