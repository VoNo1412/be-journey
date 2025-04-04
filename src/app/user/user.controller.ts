import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('by_name')
  async getUserByname(@Query('username') username: string) {
    return await this.userService.findUsers(username);
  }

  @Get('list')
  async getUsers() {
    return await this.userService.getAllUser();
  }

  @Post('online')
  async setUserOnline(@Body('userId') userId: number) {
    return await this.userService.setOnline(userId);
  }

  @Post('offline')
  async setUserOffline(@Body('userId') userId: number) {
    return await this.userService.setOffline(userId);
  }

}
