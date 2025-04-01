import { Controller, Get, UseGuards, Post, Body, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-guard.guard';
import { Request, Response } from "express";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  @Get('get-cookie')
  getCookie(@Req() req: Request) {
    const token = req.cookies['token'];
    return { token };
  }

  @Post('me')
  async getUser(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['token'];
    if (!token) {
      throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);
    }

    const data = await this.jwtService.verifyAsync(token);
    res.json({ user: { ...data.payload } });
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto, description: 'Login payload' })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const data = await this.authService.login(body);
    res.cookie('token', data.access_token, { httpOnly: true, secure: true });
    res.json({ user: { ...data }, statusCode: HttpStatus.OK });
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
