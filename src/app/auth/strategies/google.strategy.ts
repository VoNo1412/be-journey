import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    super({
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '', // Provide a default value
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '', // Provide a default value
      callbackURL: configService.get<string>('GOOGLE_CLIENT_CALLBACK') || '', // Provide a default value
      scope: ['email', 'profile'], // Adjust scopes as needed
    });
  }
  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await res.json();
      const user = await this.authService.validateOAuthUser(data);
      if (!user) throw new Error('User validation failed');
      done(null, user);
    } catch (error) {
      done(error, false); // 👈 Bắt buộc phải gọi callback
    }
  }
}