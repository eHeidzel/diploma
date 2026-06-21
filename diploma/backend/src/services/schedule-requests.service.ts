// services/schedule-requests.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ScheduleRequest,
  RequestType,
  RequestStatus,
} from '../entities/schedule-request.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { UserRole } from '@libs/shared';

@Injectable()
export class ScheduleRequestsService {
  constructor(
    @InjectRepository(ScheduleRequest)
    private scheduleRequestRepo: Repository<ScheduleRequest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async getAllRequests(): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingRequests(): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      where: { status: RequestStatus.PENDING },
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestsByUser(userId: number): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      where: { requesterId: userId },
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestById(id: number): Promise<ScheduleRequest> {
    const request = await this.scheduleRequestRepo.findOne({
      where: { id },
      relations: ['requester'],
    });
    if (!request) {
      throw new NotFoundException('Запрос не найден');
    }
    return request;
  }

  async createRequest(
    requesterId: number,
    reason: string,
  ): Promise<ScheduleRequest> {
    const requester = await this.userRepo.findOne({ where: { id: requesterId } });
    if (!requester) {
      throw new NotFoundException('Пользователь не найден');
    }

    const request = this.scheduleRequestRepo.create({
      requesterId,
      reason,
      requestType: RequestType.CANCELLATION,
      status: RequestStatus.PENDING,
    });

    const saved = await this.scheduleRequestRepo.save(request);

    // Уведомление для отправителя
    await this.notificationsService.create(
      requesterId,
      'Запрос отправлен',
      `Ваш запрос: "${reason}" успешно отправлен администратору. Ожидайте рассмотрения.`,
      NotificationType.SYSTEM,
      '/dashboard/schedule',
    );

    // Уведомление для всех администраторов (используем enum)
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN },
    });

    for (const admin of admins) {
      await this.notificationsService.create(
        admin.id,
        'Новый запрос от преподавателя',
        `Преподаватель ${requester.name} отправил запрос: ${reason}`,
        NotificationType.SYSTEM,
        '/dashboard/admin-schedule',
      );
    }

    return saved;
  }

  async approveRequest(id: number): Promise<ScheduleRequest> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно одобрить только запросы в статусе "На рассмотрении"',
      );
    }

    request.status = RequestStatus.APPROVED;
    const saved = await this.scheduleRequestRepo.save(request);

    await this.notificationsService.create(
      request.requesterId,
      'Запрос одобрен',
      `Ваш запрос "${request.reason}" был одобрен администратором`,
      NotificationType.SYSTEM,
      '/dashboard/schedule',
    );

    return saved;
  }

  async rejectRequest(id: number): Promise<ScheduleRequest> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно отклонить только запросы в статусе "На рассмотрении"',
      );
    }

    request.status = RequestStatus.REJECTED;
    const saved = await this.scheduleRequestRepo.save(request);

    await this.notificationsService.create(
      request.requesterId,
      'Запрос отклонен',
      `Ваш запрос "${request.reason}" был отклонен администратором`,
      NotificationType.SYSTEM,
      '/dashboard/schedule',
    );

    return saved;
  }

  async deleteRequest(id: number): Promise<void> {
    const request = await this.getRequestById(id);
    await this.scheduleRequestRepo.delete(id);
  }
}