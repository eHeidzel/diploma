
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserRole } from '@libs/shared';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async getTeachers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.TEACHER },
    });
  }

  async createTeacher(data: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      ...data,
      password: hashedPassword,
      role: UserRole.TEACHER,
    });
    return this.usersRepository.save(user);
  }

  async blockUser(
    id: number,
    isBlocked: boolean,
    reason: string = '',
    until?: string,
  ): Promise<User | null> {
    const updateData: Partial<User> = { isBlocked };

    if (isBlocked) {
      updateData.blockReason = reason || 'Нарушение правил';
      if (until) {
        updateData.blockUntil = new Date(until);
      }
    } else {
      updateData.blockReason = '';
      updateData.blockUntil = null as any;
    }

    await this.usersRepository.update(id, updateData);

    
    const user = await this.findOne(id);
    if (user) {
      const message = isBlocked
        ? `Ваш аккаунт заблокирован${reason ? `: ${reason}` : ''}${
            until ? ` до ${new Date(until).toLocaleDateString()}` : ''
          }`
        : 'Ваш аккаунт разблокирован';

      await this.notificationsService.create(
        id,
        isBlocked ? 'Аккаунт заблокирован' : 'Аккаунт разблокирован',
        message,
        NotificationType.SYSTEM,
        '/dashboard/profile',
      );
    }

    return this.findOne(id);
  }

  async getTeacherRequests(): Promise<any[]> {
    return [];
  }

  async processTeacherRequest(id: number, status: string): Promise<any> {
    return { success: true };
  }

  async getBlacklist(): Promise<any[]> {
    const users = await this.usersRepository.find({
      where: { isBlocked: true },
    });
    return users.map((user) => ({
      id: user.id,
      userId: user.id,
      user,
      reason: user.blockReason,
      createdAt: new Date(),
      adminName: 'Admin',
    }));
  }

  async addToBlacklist(
    userId: number,
    reason: string,
    until?: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      isBlocked: true,
      blockReason: reason || 'Нарушение правил',
      blockUntil: until ? new Date(until) : (null as any),
    });
  }

  async removeFromBlacklist(blacklistId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: blacklistId },
    });
    if (user) {
      await this.usersRepository.update(user.id, {
        isBlocked: false,
        blockReason: '',
        blockUntil: null as any,
      });
    }
  }
}
