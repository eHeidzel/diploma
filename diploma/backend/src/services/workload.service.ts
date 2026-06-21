
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule, ScheduleStatus } from '../entities/schedule.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { User } from '../entities/user.entity';
import { Activity } from '../entities/activity.entity';

@Injectable()
export class WorkloadService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
  ) {}

  async getWorkload(
    teacherId: number,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const schedules = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.activity', 'activity')
      .where('schedule.teacherId = :teacherId', { teacherId })
      .andWhere('schedule.date >= :startDate', { startDate })
      .andWhere('schedule.date <= :endDate', { endDate })
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .getMany();

    let totalHours = 0;
    let completedHours = 0;
    let plannedHours = 0;
    let cancelledHours = 0;

    const lessons = schedules.map((schedule) => {
      const start = new Date(`1970-01-01T${schedule.startTime}:00`);
      const end = new Date(`1970-01-01T${schedule.endTime}:00`);
      const durationHours =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      
      const hourType = schedule.activity?.hourType || 'academic';
      let hoursForWorkload = durationHours;

      
      if (hourType === 'academic') {
        hoursForWorkload = durationHours * 0.75;
      }

      totalHours += hoursForWorkload;

      if (schedule.status === ScheduleStatus.COMPLETED) {
        completedHours += hoursForWorkload;
      } else if (schedule.status === ScheduleStatus.PLANNED) {
        plannedHours += hoursForWorkload;
      } else if (schedule.status === ScheduleStatus.CANCELLED) {
        cancelledHours += hoursForWorkload;
      }

      return {
        id: schedule.id,
        date: schedule.date,
        activityTitle: schedule.activity?.title || 'Без названия',
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        duration: `${durationHours.toFixed(1)}ч`,
        hourType,
        status: schedule.status,
        
        hoursAstronomical: Math.round(hoursForWorkload * 10) / 10,
      };
    });

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      plannedHours: Math.round(plannedHours * 10) / 10,
      cancelledHours: Math.round(cancelledHours * 10) / 10,
      lessons,
    };
  }

  async getMyStudents(teacherId: number): Promise<any[]> {
    const schedules = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.teacherId = :teacherId', { teacherId })
      .getMany();

    if (schedules.length === 0) {
      return [];
    }

    const activityIds = schedules.map((s) => s.activityId);

    const enrollments = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('enrollment.activityId IN (:...activityIds)', { activityIds })
      .getMany();

    const studentsMap = new Map();
    for (const enrollment of enrollments) {
      if (!studentsMap.has(enrollment.userId)) {
        const user = enrollment.user;
        studentsMap.set(enrollment.userId, {
          id: user.id,
          name: user.name || 'Не указано',
          email: user.email || 'Не указан',
          avatar: user.avatar || null,
          phone: user.phone || null,
          group: (user as any).group || 'Индивидуально',
        });
      }
    }

    return Array.from(studentsMap.values());
  }

  async getStudentProfile(teacherId: number, studentId: number): Promise<any> {
    const schedules = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.teacherId = :teacherId', { teacherId })
      .getMany();

    if (schedules.length === 0) {
      throw new NotFoundException('No schedules found for this teacher');
    }

    const activityIds = schedules.map((s) => s.activityId);

    const enrollment = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('enrollment.userId = :studentId', { studentId })
      .andWhere('enrollment.activityId IN (:...activityIds)', { activityIds })
      .getOne();

    if (!enrollment) {
      throw new NotFoundException('Student not found for this teacher');
    }

    const user = enrollment.user;

    return {
      id: user.id,
      name: user.name || 'Не указано',
      email: user.email || 'Не указан',
      avatar: user.avatar || null,
      phone: user.phone || null,
      group: (user as any).group || 'Индивидуально',
    };
  }

  async getMyGroups(teacherId: number): Promise<string[]> {
    const schedules = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.teacherId = :teacherId', { teacherId })
      .getMany();

    if (schedules.length === 0) {
      return [];
    }

    const activityIds = schedules.map((s) => s.activityId);

    const enrollments = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('enrollment.activityId IN (:...activityIds)', { activityIds })
      .getMany();

    const groups = new Set<string>();
    for (const enrollment of enrollments) {
      if (enrollment.user && (enrollment.user as any).group) {
        groups.add((enrollment.user as any).group);
      }
    }

    return Array.from(groups);
  }

  async getTeacherStats(teacherId: number): Promise<any> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    return this.getWorkload(teacherId, startDate, endDate);
  }

  async getAllStudents(teacherId: number): Promise<any[]> {
    return this.getMyStudents(teacherId);
  }
}
