import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Like, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from '../auth/dto/login.dto';
import { hashPassword } from '../auth/config/hashPassword';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';

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
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  formatLastSeen(lastSeen: Date) {
    const date = new Date(lastSeen);
    const now = new Date();

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    const isYesterday = (d1: Date, d2: Date) => {
      const yesterday = new Date(d2);
      yesterday.setDate(d2.getDate() - 1);
      return isSameDay(d1, yesterday);
    };

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (isSameDay(date, now)) {
      return `Today at ${hours}:${minutes}`;
    } else if (isYesterday(date, now)) {
      return `Yesterday at ${hours}:${minutes}`;
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month} at ${hours}:${minutes}`;
    }
  };

  async getAllUser(userId: number) {
    try {
      const user = await this.userRepository.find({ where: { id: Not(userId) } });
      if (!user.length) return [];

      return user?.map(x => ({
        userId: x.id,
        username: x.username,
        avatar: x.avatar,
        status: x.isOnline,
        lastSeen: this.formatLastSeen(x.lastSeen)
      }));
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async setStatus(userId: number, status: boolean): Promise<User | any> {
    try {
      const vietnamTime = moment().tz('Asia/Ho_Chi_Minh').toDate();
      return await this.userRepository.save({ id: userId, isOnline: status, lastSeen: vietnamTime });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async findByEmail(email: string): Promise<any> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async create(userData: any): Promise<any> {
    const user = this.userRepository.create({ ...userData });
    return await this.userRepository.save(user);
  }
}
