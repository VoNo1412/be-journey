import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/login.dto';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-guard.guard';
import { UserService } from '../user/user.service';
import { CookieDecorator } from 'src/common/decorator/cookie.decorator';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) { }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpDto, description: 'User signup payload' })
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      return await this.authService.signUp(signUpDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to register user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto, description: 'User login payload' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const data = await this.authService.login(loginDto);
      res.cookie('access_token', data.access_token, { httpOnly: true, secure: false });
      res.json({ user: data, access_token: data.access_token, statusCode: HttpStatus.OK });
    } catch (error) {
      throw new HttpException(
        error.message || 'Login failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      if (!refreshToken) {
        throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
      }
      const { access_token, refresh_token } = await this.authService.refresh(refreshToken);
      // Update cookies
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { message: 'Token refreshed', statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        error.message || 'Token refresh failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out a user' })
  async logout(@Res({ passthrough: true }) res: Response) {
    try {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return { message: 'Logout successful', statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        error.message || 'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get authenticated user details' })
  async getUser(@CookieDecorator("access_token") token: string) {
    try {
      if (!token) {
        throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);
      }

      const user = await this.jwtService.verifyAsync(token);
      return { user, status: HttpStatus.OK }
    } catch (error) {
      throw new HttpException(
        error.message || 'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('oauth2')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate OAuth2 login' })
  oauth2Login() {
    // Passport handles redirect to OAuth2 provider
  }

  @Get('oauth2/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'OAuth2 callback' })
  async oauth2Callback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const user = req.user;
      const { access_token, refresh_token } = await this.authService.loginGoogle(user);
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(process.env.FRONTEND_URL + `/login/success?token=${access_token}`);
    } catch (error) {
      res.redirect(process.env.FRONTEND_URL + '/auth/error');
    }
  }
}