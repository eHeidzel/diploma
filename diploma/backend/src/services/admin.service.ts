
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { Schedule } from '../entities/schedule.entity';
import {
  ScheduleRequest,
  RequestStatus,
} from '../entities/schedule-request.entity';
import { UserAccess } from '../entities/user-access.entity';
import { UserRole } from '@libs/shared';

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
  ) {}

  
  async getUsers() {
    return this.userRepo.find();
  }

  async getTeachers() {
    return this.userRepo.find({ where: { role: UserRole.TEACHER } });
  }

  async createTeacher(data: any) {
    const user = this.userRepo.create({ ...data, role: UserRole.TEACHER });
    return this.userRepo.save(user);
  }

  async updateUser(id: number, data: any) {
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
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

    await this.userRepo.update(id, {
      isBlocked,
      blockReason: reason,
    });

    return {
      message: isBlocked
        ? 'Пользователь заблокирован'
        : 'Пользователь разблокирован',
    };
  }

  
  async getBlacklist() {
    return this.userRepo.find({
      where: { isBlocked: true },
      select: ['id', 'name', 'email', 'phone', 'blockReason', 'blockUntil', 'createdAt'],
    });
  }

  
  async getTeacherRequests() {
    
    return this.scheduleRequestRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async processTeacherRequest(id: number, status: string) {
    const request = await this.scheduleRequestRepo.findOne({ 
      where: { id },
      relations: ['requester', 'schedule'],
    });
    if (!request) throw new NotFoundException('Заявка не найдена');
    
    await this.scheduleRequestRepo.update(id, {
      status: status === 'approved' ? RequestStatus.APPROVED : RequestStatus.REJECTED,
    });
    
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
    return this.userAccessRepo.find({ relations: ['teacher'] });
  }

  async getAccessByTeacher(teacherId: number) {
    return this.userAccessRepo.find({
      where: { teacherId },
      relations: ['teacher'],
    });
  }

  async grantAccess(data: {
    teacherId: number;
    category: string;
    googleDriveLink: string;
  }) {
    const access = this.userAccessRepo.create(data);
    return this.userAccessRepo.save(access);
  }

  async updateAccess(
    id: number,
    data: { category?: string; googleDriveLink?: string },
  ) {
    await this.userAccessRepo.update(id, data);
    return this.userAccessRepo.findOne({ where: { id } });
  }

  async revokeAccess(id: number) {
    await this.userAccessRepo.delete(id);
    return { message: 'Доступ отозван' };
  }

  
  async getScheduleRequests() {
    return this.scheduleRequestRepo.find({
      relations: ['schedule', 'requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingScheduleRequests() {
    return this.scheduleRequestRepo.find({
      where: { status: RequestStatus.PENDING },
      relations: ['schedule', 'requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getScheduleRequest(id: number) {
    const request = await this.scheduleRequestRepo.findOne({
      where: { id },
      relations: ['schedule', 'requester'],
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
    return { message: 'Запрос отклонен' };
  }

  async deleteScheduleRequest(id: number) {
    const request = await this.scheduleRequestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Запрос не найден');
    await this.scheduleRequestRepo.delete(id);
    return { message: 'Запрос удален' };
  }
}