
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@entities/user.entity';
import { I18nContext } from 'nestjs-i18n';
import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { UserBalance } from '../entities/user-balance.entity';
import { UserRole } from 'src/enums/UserRole.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    birthDate?: string,
  ): Promise<{ user: Partial<User>; token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      birthDate: birthDate,
      role: UserRole.STUDENT,
    });

    await this.userRepository.save(user);

    
    const balance = this.balanceRepository.create({
      userId: user.id,
      balance: 0,
    });
    await this.balanceRepository.save(balance);

    
    await this.emailService.sendRegistrationEmail(email, name);

    
    await this.notificationsService.create(
      user.id,
      'Добро пожаловать в CodeZone!',
      `Здравствуйте, ${name}! Рады видеть вас в нашей школе программирования. Начните обучение прямо сейчас.`,
      NotificationType.SYSTEM,
      '/dashboard/learning',
    );

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(
    email: string,
    password: string,
    i18n?: I18nContext,
  ): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        i18n?.t('auth.errors.invalidCredentials') || 'Invalid credentials',
      );
    }

    
    if (user.isBlocked) {
      const blockReason = user.blockReason || 'Ваш аккаунт заблокирован';
      throw new UnauthorizedException(blockReason);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        i18n?.t('auth.errors.invalidCredentials') || 'Invalid credentials',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const balance = await this.balanceRepository.findOne({
      where: { userId: user.id },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      balance: balance?.balance || 0,
    };
  }
}
