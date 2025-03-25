import { Controller, Get, UseGuards, Post, Injectable, Body, Req, Res, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-guard.guard';
import { Request, Response } from "express";
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
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
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data = await this.jwtService.verifyAsync(token);
    return res.json({ user: { ...data.payload } });
  }

  @Get('clear-cookie')
  clearCookie(@Res() res: Response) {
    res.clearCookie('token');
    res.send('Cookie has been cleared!');
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto, description: 'Login payload' })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const data = await this.authService.login(body);
    res.cookie('token', data.access_token, { httpOnly: true, secure: false });
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
