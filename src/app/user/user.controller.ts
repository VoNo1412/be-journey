import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
