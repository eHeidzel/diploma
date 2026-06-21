
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
import { Schedule } from '../entities/schedule.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ScheduleRequestsService {
  constructor(
    @InjectRepository(ScheduleRequest)
    private scheduleRequestRepo: Repository<ScheduleRequest>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getAllRequests(): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      relations: ['schedule', 'requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingRequests(): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      where: { status: RequestStatus.PENDING },
      relations: ['schedule', 'requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestsByUser(userId: number): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      where: { requesterId: userId },
      relations: ['schedule', 'requester'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestById(id: number): Promise<ScheduleRequest> {
    const request = await this.scheduleRequestRepo.findOne({
      where: { id },
      relations: ['schedule', 'requester'],
    });
    if (!request) {
      throw new NotFoundException('Запрос не найден');
    }
    return request;
  }

  async createRequest(
    requesterId: number,
    data: {
      scheduleId: number;
      requestType: RequestType;
      reason: string;
      proposedDate?: string;
      proposedTime?: string;
    },
  ): Promise<ScheduleRequest> {
    
    const schedule = await this.scheduleRepo.findOne({
      where: { id: data.scheduleId },
    });
    if (!schedule) {
      throw new NotFoundException('Расписание не найдено');
    }

    
    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
    });
    if (!requester) {
      throw new NotFoundException('Пользователь не найден');
    }

    
    if (requester.role !== 'teacher') {
      throw new BadRequestException(
        'Только преподаватели могут создавать запросы',
      );
    }

    
    if (schedule.teacherId !== requesterId) {
      throw new BadRequestException(
        'Вы можете создавать запросы только для своих занятий',
      );
    }

    
    const existingRequest = await this.scheduleRequestRepo.findOne({
      where: {
        scheduleId: data.scheduleId,
        status: RequestStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException(
        'Для этого занятия уже есть активный запрос',
      );
    }

    const request = this.scheduleRequestRepo.create({
      scheduleId: data.scheduleId,
      requesterId,
      requestType: data.requestType,
      reason: data.reason,
      proposedDate: data.proposedDate,
      proposedTime: data.proposedTime,
      status: RequestStatus.PENDING,
    });

    return this.scheduleRequestRepo.save(request);
  }

  async approveRequest(id: number): Promise<ScheduleRequest> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно одобрить только запросы в статусе "На рассмотрении"',
      );
    }

    request.status = RequestStatus.APPROVED;
    return this.scheduleRequestRepo.save(request);
  }

  async rejectRequest(id: number): Promise<ScheduleRequest> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно отклонить только запросы в статусе "На рассмотрении"',
      );
    }

    request.status = RequestStatus.REJECTED;
    return this.scheduleRequestRepo.save(request);
  }

  async deleteRequest(id: number): Promise<void> {
    const request = await this.getRequestById(id);
    await this.scheduleRequestRepo.delete(id);
  }

  async getRequestsBySchedule(scheduleId: number): Promise<ScheduleRequest[]> {
    return this.scheduleRequestRepo.find({
      where: { scheduleId },
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }
}
