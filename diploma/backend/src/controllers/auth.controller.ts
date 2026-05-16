import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { AuthService } from '@services/auth.service';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: string;
    },
    @I18n() i18n: I18nContext,
  ) {
    try {
      return await this.authService.register(body);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        throw new ConflictException(
          i18n.t('auth.controller.register.conflict'),
        );
      }
      throw error;
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return await this.authService.login(body.email, body.password);
  }
}
