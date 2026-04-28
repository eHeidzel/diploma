import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '@services/users.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(userData: any) {
    // Проверяем, существует ли пользователь
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = this.hashPassword(userData.password);
    const user = await this.usersService.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'student',
    });

    const { password, ...result } = user;
    return {
      success: true,
      user: result,
      message: 'Регистрация успешна',
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.password !== this.hashPassword(password)) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password: _, ...result } = user;
    return {
      success: true,
      user: result,
      message: 'Вход выполнен успешно',
    };
  }
}
