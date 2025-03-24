import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from '../auth/dto/login.dto';
import { hashPassword } from '../auth/config/hashPassword';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService

  ) { }

  async signUp(user: LoginDto): Promise<any> {
    try {
      const newPassword = await hashPassword(user.password);
      const newUser = this.userRepository.create({ name: user.username, password: newPassword });
      await this.userRepository.save(newUser);
      const token = this.jwtService.sign({ payload: {userId: newUser.userId, username: newUser.name} }, { secret: this.configService.get<string>("JWT_SECRET") });
      return { statusCode: HttpStatus.OK, userId: newUser.userId, accessToken: token }
    } catch (error) {
      throw new Error(error);
    }
  }

  async findUser(username: string) {
    const user = await this.userRepository.findOneBy({ name: username });
    console.log('user: ', user);
    if (!user) throw new Error("User not found");

    return user;
  }
}
