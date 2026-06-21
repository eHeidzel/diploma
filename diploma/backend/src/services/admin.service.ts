// services/admin.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { Schedule } from '../entities/schedule.entity';
import {
  ScheduleRequest,
  RequestStatus,
  RequestType,
} from '../entities/schedule-request.entity';
import { UserAccess } from '../entities/user-access.entity';
import { UserRole } from '@libs/shared';
import { UserBalance } from '../entities/user-balance.entity';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(ScheduleRequest)
    private scheduleRequestRepo: Repository<ScheduleRequest>,
    @InjectRepository(UserAccess)
    private userAccessRepo: Repository<UserAccess>,
    @InjectRepository(UserBalance)
    private balanceRepo: Repository<UserBalance>,
    private notificationsService: NotificationsService,
  ) {}

  async getUsers() {
    return this.userRepo.find();
  }

  async getTeachers() {
    return this.userRepo.find({ where: { role: UserRole.TEACHER } });
  }

  async createTeacher(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
      role: UserRole.TEACHER,
    });

    const saved = await this.userRepo.save(user);
    const teacher = saved[0] || saved;

    const balance = this.balanceRepo.create({
      userId: teacher.id,
      balance: 0,
    });
    await this.balanceRepo.save(balance);

    await this.notificationsService.create(
      teacher.id,
      'Добро пожаловать в CodeZone!',
      `Здравствуйте, ${teacher.name}! Вы были зарегистрированы как преподаватель.`,
      NotificationType.SYSTEM,
      '/dashboard/profile',
    );

    const { password, ...result } = teacher;
    return result;
  }

  async updateUser(id: number, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await this.userRepo.update(id, data);
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { password, ...result } = user;
    return result;
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    await this.userRepo.delete(id);
    return { message: 'Пользователь удален' };
  }

  async blockUser(
    id: number,
    isBlocked: boolean,
    reason?: string,
    until?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const updateData: any = {
      isBlocked,
      blockReason: reason,
    };

    if (until) {
      updateData.blockUntil = new Date(until);
    }

    await this.userRepo.update(id, updateData);

    return {
      message: isBlocked
        ? 'Пользователь заблокирован'
        : 'Пользователь разблокирован',
    };
  }

  async getBlacklist() {
    return this.userRepo.find({
      where: { isBlocked: true },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'blockReason',
        'blockUntil',
        'createdAt',
      ],
    });
  }

  async getTeacherRequests() {
    return this.scheduleRequestRepo.find({
      where: { requestType: RequestType.CANCELLATION },
      order: { createdAt: 'DESC' },
    });
  }

  async processTeacherRequest(id: number, status: string) {
    const request = await this.scheduleRequestRepo.findOne({
      where: { id },
    });
    if (!request) throw new NotFoundException('Заявка не найдена');

    await this.scheduleRequestRepo.update(id, {
      status: status === 'approved' ? RequestStatus.APPROVED : RequestStatus.REJECTED,
    });

    if (status === 'approved') {
      await this.userRepo.update(request.requesterId, { role: UserRole.TEACHER });
    }

    return {
      message: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
    };
  }

  async getActivities() {
    return this.activityRepo.find();
  }

  async createActivity(data: any) {
    return this.activityRepo.save(data);
  }

  async updateActivity(id: number, data: any) {
    await this.activityRepo.update(id, data);
    return this.activityRepo.findOne({ where: { id } });
  }

  async deleteActivity(id: number) {
    await this.activityRepo.delete(id);
    return { message: 'Активность удалена' };
  }

  async getSchedule() {
    return this.scheduleRepo.find({ relations: ['teacher'] });
  }

  async createSchedule(data: any) {
    return this.scheduleRepo.save(data);
  }

  async updateSchedule(id: number, data: any) {
    await this.scheduleRepo.update(id, data);
    return this.scheduleRepo.findOne({ where: { id } });
  }

  async deleteSchedule(id: number) {
    await this.scheduleRepo.delete(id);
    return { message: 'Занятие удалено' };
  }

  async getAccesses() {
    return this.userAccessRepo.find({ relations: ['user'] });
  }

  async getAccessByTeacher(teacherId: number) {
    return this.userAccessRepo.find({
      where: { userId: teacherId },
      relations: ['user'],
    });
  }

  async revokeAccess(id: number) {
    await this.userAccessRepo.delete(id);
    return { message: 'Доступ отозван' };
  }

  async getScheduleRequests() {
    return this.scheduleRequestRepo.find({
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingScheduleRequests() {
    return this.scheduleRequestRepo.find({
      where: { status: RequestStatus.PENDING },
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getScheduleRequest(id: number) {
    const request = await this.scheduleRequestRepo.findOne({
      where: { id },
      relations: ['requester'],
    });
    if (!request) throw new NotFoundException('Запрос не найден');
    return request;
  }

  async approveScheduleRequest(id: number) {
    const request = await this.getScheduleRequest(id);
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно одобрить только запросы в статусе "На рассмотрении"',
      );
    }
    await this.scheduleRequestRepo.update(id, {
      status: RequestStatus.APPROVED,
    });
    await this.notificationsService.create(
      request.requesterId,
      'Запрос одобрен',
      `Ваш запрос "${request.reason}" был одобрен администратором`,
      NotificationType.SYSTEM,
      '/dashboard/schedule',
    );
    return { message: 'Запрос одобрен' };
  }

  async rejectScheduleRequest(id: number) {
    const request = await this.getScheduleRequest(id);
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно отклонить только запросы в статусе "На рассмотрении"',
      );
    }
    await this.scheduleRequestRepo.update(id, {
      status: RequestStatus.REJECTED,
    });
    await this.notificationsService.create(
      request.requesterId,
      'Запрос отклонен',
      `Ваш запрос "${request.reason}" был отклонен администратором`,
      NotificationType.SYSTEM,
      '/dashboard/schedule',
    );
    return { message: 'Запрос отклонен' };
  }

  async deleteScheduleRequest(id: number) {
    const request = await this.scheduleRequestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Запрос не найден');
    await this.scheduleRequestRepo.delete(id);
    return { message: 'Запрос удален' };
  }
}