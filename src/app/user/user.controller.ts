import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('by_name')
  async getUserByname(@Query('username') username: string) {
    return await this.userService.findUsers(username);
  }

  @Get('list/:userId')
  async getUsers(@Param('userId') userId: number) {
    return await this.userService.getAllUser(+userId);
  }
}
