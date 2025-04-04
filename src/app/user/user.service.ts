import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
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
      const newUser = this.userRepository.create({ username: user.username, password: newPassword });
      await this.userRepository.save(newUser);
      const token = this.jwtService.sign({ payload: { userId: newUser.id, username: newUser.username } }, { secret: this.configService.get<string>("JWT_SECRET") });
      return { statusCode: HttpStatus.OK, userId: newUser.id, accessToken: token }
    } catch (error) {
      throw new Error(error);
    }
  }

  async findUser(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    return user;
  }

  async findUsers(username: string) {
    const users = await this.userRepository.find({
      where: { username: Like(`%${username}%`) },
    });
    if (!users.length) {
      return []
    } else {
      return users;
    }
  }

  async findUserById(userId: number) {
    try {
      return await this.userRepository.findOneBy({ id: userId });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUser() {
    try {
      const user = await this.userRepository.find();
      if (!user.length) return [];
      return user?.map(x => ({ username: x.username, avatar: x.avatar, status: x.isOnline, lastSeen: x.lastSeen }));
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async setOnline(userId: number): Promise<User | any> {
    try {
      return await this.userRepository.save({ id: userId, isOnline: true });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async setOffline(userId: number): Promise<User> {
    return await this.userRepository.save({ id: userId, isOnline: false, lastSeen: new Date() });
  }
}
