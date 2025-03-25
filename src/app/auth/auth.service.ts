
import { Injectable } from '@nestjs/common';
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
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUser(username);
    const checkPassword = await bcrypt.compare(pass, user.password);
    if(!checkPassword) throw new Error("Password is wrong!")
    return user;
  }

  async login(body: LoginDto) {
    try {
      const user = await this.userService.findUser(body.username);
      const jwt = await this.jwtService.signAsync({payload: user}, {secret: this.configService.get<string>("JWT_SECRET")});
  
      return {
        ...user,
        access_token: jwt,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async signUp(user: LoginDto) {
      return await this.userService.signUp(user);
  }
}
