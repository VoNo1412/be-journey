import { Controller, Get, UseGuards, Post, Injectable, Body, Req, UnauthorizedException  } from '@nestjs/common';
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

  // @UseGuards(JwtAuthGuard)
  @Get('cookie')
  @ApiBearerAuth()
  async getProfile(@Req() req: Request) {
    try {
      const cookie = req.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        throw new UnauthorizedException();
      }

      // const user = await this.
      return data;
      
    } catch (error) {
      throw new Error(error);
    }
  }

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
