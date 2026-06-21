
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { UserBalance } from '../entities/user-balance.entity';
import { EmailService } from './email.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserSettings)
    private settingsRepo: Repository<UserSettings>,
    @InjectRepository(UserBalance)
    private balanceRepo: Repository<UserBalance>,
    private emailService: EmailService,
  ) {}

  async getProfile(userId: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const settings = await this.settingsRepo.findOne({ where: { userId } });
    const balance = await this.balanceRepo.findOne({ where: { userId } });

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      settings: settings || {},
      balance: balance?.balance || 0,
    };
  }

  async updateProfile(
    userId: number,
    data: {
      name?: string;
      phone?: string;
      city?: string;
      bio?: string;
    },
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, data);
    await this.userRepo.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters',
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    
    await this.emailService.sendPasswordChangeEmail(user.email, user.name);
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = avatarUrl;
    await this.userRepo.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
