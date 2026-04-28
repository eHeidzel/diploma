import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { AuthService } from '@services/auth.service';

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
  ) {
    try {
      return await this.authService.register(body);
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
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
