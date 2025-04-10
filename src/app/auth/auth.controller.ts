import { Controller, Get, UseGuards, Post, Body, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-guard.guard';
import { Response } from "express";
import { JwtService } from '@nestjs/jwt';
import { CookieDecorator } from 'src/common/decorator/cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }

  @Post('me')
  async getUser(@CookieDecorator('token') token: string) {
    try {
      if (!token) throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);
      const data = await this.jwtService.verifyAsync(token);
      return { user: { ...data.payload } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto, description: 'Login payload' })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const data = await this.authService.login(body);
      res.cookie('token', data.access_token, { httpOnly: true, secure: false });
      res.json({ user: { ...data }, statusCode: HttpStatus.OK });
    } catch (error) {
      throw new HttpException(error.message || 'An error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup')
  signUp(@Body() body: LoginDto) {
    return this.authService.signUp(body);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    console.log(' run inside here pls')
    return { msg: "Redirecting to Google..." };
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async callback() {
    console.log('run inside here')
    return { msg: "duma" };
  }
}
