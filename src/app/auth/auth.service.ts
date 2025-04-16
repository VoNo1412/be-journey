
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUser(username);
    const checkPassword = await bcrypt.compare(pass, user.password);
    if (!checkPassword) throw new HttpException("Password is wrong", HttpStatus.UNAUTHORIZED);
    return user;
  }
  async validateOAuthUser(profile: any): Promise<any> {
    const { email, name, picture } = profile;
    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.create({
        email,
        username: name,
        avatar: picture
      });
    }

    return user;
  }
 
  async login(body: LoginDto) {
    try {
      const user = await this.userService.findUser(body.username);
      const payload = {...user}
      const jwt = await this.jwtService.signAsync(payload, { secret: this.configService.get<string>("JWT_SECRET") });
      if (!jwt) throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);
      
      return {
        ...user,
        access_token: jwt,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
    }
  }

  async loginGoogle(loginDto: LoginDto | any) {
    // Validate credentials or OAuth2 user
    const payload = { sub: loginDto.id, ...loginDto}; // Customize payload
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refresh(refreshToken: string) {
    // Verify refresh token
    // Generate new access and refresh tokens
    const payload = await this.jwtService.verifyAsync(refreshToken);
    return {
      access_token: this.jwtService.sign({ sub: payload.sub, email: payload.email }, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign({ sub: payload.sub, email: payload.email }, { expiresIn: '7d' }),
    };
  }

  async signUp(user: LoginDto) {
    return await this.userService.signUp(user);
  }
}
