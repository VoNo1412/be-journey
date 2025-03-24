import { Controller, Get, UseGuards, Request, Post, Injectable, Body, SetMetadata } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-guard.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // @ApiBearerAuth()
  // getProfile(@Request() req) {
  //   return req.user;
  // }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto, description: 'Login payload' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('signup')
  signUp(@Body() body: LoginDto) {
    return this.authService.signUp(body);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    return { msg: "Redirecting to Google..." };
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async callback() {
    return { msg: "duma" };
  }
}
