
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

  async login(body: LoginDto) {
    try {
      const user = await this.userService.findUser(body.username);
      const jwt = await this.jwtService.signAsync({ payload: user }, { secret: this.configService.get<string>("JWT_SECRET") });
      if (!jwt) throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);
      
      return {
        ...user,
        access_token: jwt,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
    }
  }

  async signUp(user: LoginDto) {
    return await this.userService.signUp(user);
  }
}
