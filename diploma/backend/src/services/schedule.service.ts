
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Schedule, ScheduleStatus } from '../entities/schedule.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Activity } from '../entities/activity.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private generateMeetLink(): string {
    const chars: string =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result: string = '';
    for (let i: number = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `https://meet.google.com/${result}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async createFromBooking(
    activityId: number,
    teacherId: number,
    date: string,
    startTime: string,
    endTime: string,
    maxStudents: number = 20,
    meetLink?: string,
  ): Promise<Schedule> {
    const schedule: Schedule = this.scheduleRepository.create({
      activityId,
      teacherId,
      date,
      startTime,
      endTime,
      maxStudents,
      meetLink: meetLink || this.generateMeetLink(),
      status: ScheduleStatus.PLANNED,
      enrolledCount: 0,
    });
    return this.scheduleRepository.save(schedule);
  }

  async create(scheduleData: Partial<Schedule>): Promise<Schedule> {
    const schedule: Schedule = this.scheduleRepository.create(scheduleData);
    return await this.scheduleRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { status: ScheduleStatus.PLANNED },
      relations: ['activity', 'teacher'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule | null> {
    return await this.scheduleRepository.findOne({
      where: { id },
      relations: ['activity', 'teacher'],
    });
  }

  async findByTeacher(teacherId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { teacherId, status: ScheduleStatus.PLANNED },
      relations: ['activity', 'teacher'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findByActivity(activityId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { activityId, status: ScheduleStatus.PLANNED },
      relations: ['activity', 'teacher'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async update(
    id: number,
    scheduleData: Partial<Schedule>,
  ): Promise<Schedule | null> {
    await this.scheduleRepository.update(id, scheduleData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRepository.delete(id);
  }

  async getStudentSchedule(studentId: number): Promise<Schedule[]> {
    const today = new Date();
    const todayStr = this.formatDate(today);

    return this.scheduleRepository
      .createQueryBuilder('s')
      .innerJoin('s.enrollments', 'e')
      .leftJoinAndSelect('s.activity', 'a')
      .leftJoinAndSelect('s.teacher', 't')
      .where('e.userId = :studentId', { studentId })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .andWhere('s.date >= :today', { today: todayStr })
      .orderBy('s.date', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getMany();
  }

  async getAvailableSchedules(activityId: number): Promise<Schedule[]> {
    const activity: Activity | null = await this.activityRepository.findOne({
      where: { id: activityId, isActive: true },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.type !== 'group') {
      throw new Error('Only group activities have schedules');
    }

    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    return await this.scheduleRepository.find({
      where: {
        activityId,
        status: ScheduleStatus.PLANNED,
        date: Between(
          this.formatDate(today),
          this.formatDate(threeMonthsLater),
        ),
      },
      relations: ['teacher'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async enrollInSchedule(
    scheduleId: number,
    studentId: number,
  ): Promise<Enrollment> {
    const schedule: Schedule | null = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['activity'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.enrolledCount >= schedule.maxStudents) {
      throw new Error('No available spots in this class');
    }

    const existingEnrollment: Enrollment | null =
      await this.enrollmentRepository.findOne({
        where: {
          userId: studentId,
          activityId: schedule.activityId,
        },
      });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    const enrollment: Enrollment = this.enrollmentRepository.create({
      userId: studentId,
      activityId: schedule.activityId,
      scheduleId: scheduleId,
      isPaid: schedule.activity.price === 0,
      paidAmount: schedule.activity.price || 0,
    });
    await this.enrollmentRepository.save(enrollment);

    schedule.enrolledCount += 1;
    await this.scheduleRepository.save(schedule);

    return enrollment;
  }

  async cancelEnrollment(scheduleId: number, studentId: number): Promise<void> {
    const schedule: Schedule | null = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['activity'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.enrollmentRepository.delete({
      userId: studentId,
      activityId: schedule.activityId,
    });

    schedule.enrolledCount -= 1;
    await this.scheduleRepository.save(schedule);
  }

  async getTeacherSchedule(
    teacherId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.activity', 'a')
      .leftJoinAndSelect('s.teacher', 't')
      .where('s.teacherId = :teacherId', { teacherId })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      });

    if (startDate) {
      query.andWhere('s.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('s.date <= :endDate', { endDate });
    }

    return await query
      .orderBy('s.date', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getMany();
  }

  async getEnrolledStudents(scheduleId: number): Promise<any[]> {
    const schedule: Schedule | null = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['activity'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const enrollments: Enrollment[] = await this.enrollmentRepository.find({
      where: { activityId: schedule.activityId },
      relations: ['user'],
    });

    return enrollments.map((enrollment: Enrollment) => ({
      id: enrollment.user.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
      avatar: enrollment.user.avatar,
      enrolledAt: enrollment.enrolledAt,
    }));
  }

  async checkEnrollment(
    activityId: number,
    userId: number,
  ): Promise<{ enrolled: boolean }> {
    const enrollment: Enrollment | null =
      await this.enrollmentRepository.findOne({
        where: { userId, activityId },
      });
    return { enrolled: !!enrollment };
  }

  async getSchedulesByDateRange(
    startDate: string,
    endDate: string,
    teacherId?: number,
  ): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.activity', 'a')
      .leftJoinAndSelect('s.teacher', 't')
      .where('s.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      });

    if (teacherId) {
      query.andWhere('s.teacherId = :teacherId', { teacherId });
    }

    return query
      .orderBy('s.date', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getMany();
  }

  async getStudentUpcomingCount(studentId: number): Promise<number> {
    const today = this.formatDate(new Date());

    return this.scheduleRepository
      .createQueryBuilder('s')
      .innerJoin('s.enrollments', 'e')
      .where('e.userId = :studentId', { studentId })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .andWhere('s.date >= :today', { today })
      .getCount();
  }

  async getUpcomingSchedules(
    userId: number,
    limit: number = 5,
  ): Promise<Schedule[]> {
    const today = this.formatDate(new Date());

    return this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.activity', 'a')
      .leftJoinAndSelect('s.teacher', 't')
      .innerJoin('s.enrollments', 'e')
      .where('e.userId = :userId', { userId })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .andWhere('s.date >= :today', { today })
      .orderBy('s.date', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .limit(limit)
      .getMany();
  }

  async getScheduleWithDetails(id: number): Promise<Schedule | null> {
    return this.scheduleRepository.findOne({
      where: { id },
      relations: ['activity', 'teacher', 'enrollments', 'enrollments.user'],
    });
  }

  async updateScheduleStatus(
    id: number,
    status: ScheduleStatus,
  ): Promise<Schedule | null> {
    await this.scheduleRepository.update(id, { status });
    return this.findOne(id);
  }
}
