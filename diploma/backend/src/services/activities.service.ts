
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType, HourType } from '../entities/activity.entity';
import { ActivityReview } from '../entities/activity-review.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Schedule, ScheduleStatus } from '../entities/schedule.entity';
import { TranslationService } from './translation.service';
import { Language } from '@libs/shared';
import { UserBalance } from '../entities/user-balance.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { ScheduleService } from './schedule.service';

export interface IActivityResponse {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  teacher: string;
  teacherAvatar: string | null;
  duration: string;
  hourType: HourType | null;
  price: number | null;
  rating: number;
  enrolledCount: number;
  reviewsCount: number;
  categories: string[];
  availableTimes: string[] | null;
  availableSlots: string[] | null;
  availableDates: { date: string; times: string[] }[] | null;
  availableAgeGroups: string[] | null;
  groupPeriod: string | null;
  groupShift: string | null;
  learningPlan: any[] | null;
  targetAudience: any;
}

interface IIndividualScheduleData {
  startDate: string;
  time: string;
  schedule?: Array<{ day: string; time: string }>;
  ageGroup?: string;
  teacherId?: number;
}

interface IGroupScheduleData {
  period: string;
  shift: string;
  startDate: string;
  ageGroup?: string;
}

interface ISingleScheduleData {
  date: string;
  time: string;
}

const DAYS_OF_WEEK: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(ActivityReview)
    private readonly reviewRepo: Repository<ActivityReview>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(UserBalance)
    private readonly balanceRepo: Repository<UserBalance>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly translationService: TranslationService,
    private readonly notificationsService: NotificationsService,
    private readonly scheduleService: ScheduleService,
  ) {}

  private async computeActivityStats(
    activityId: number,
  ): Promise<{ rating: number; enrolledCount: number; reviewsCount: number }> {
    const enrolledCount: number = await this.enrollmentRepo.count({
      where: { activityId },
    });
    const reviews: ActivityReview[] = await this.reviewRepo.find({
      where: { activityId },
      select: ['rating'],
    });
    const reviewsCount: number = reviews.length;
    const averageRating: number =
      reviewsCount > 0
        ? reviews.reduce(
            (sum: number, r: ActivityReview) => sum + r.rating,
            0,
          ) / reviewsCount
        : 0;

    return {
      rating: parseFloat(averageRating.toFixed(1)),
      enrolledCount,
      reviewsCount,
    };
  }

  private parseDurationToMinutes(duration: string): number {
    if (!duration) return 60;

    const str = duration.toLowerCase().trim();

    const minMatch = str.match(/(\d+)\s*мин/);
    if (minMatch) {
      return parseInt(minMatch[1], 10);
    }

    const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*час/);
    if (hourMatch) {
      return Math.round(parseFloat(hourMatch[1]) * 60);
    }

    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      return Math.round(parseFloat(numMatch[1]) * 60);
    }

    return 60;
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

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

  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private isBeforeOrEqual(date1: Date, date2: Date): boolean {
    return date1.getTime() <= date2.getTime();
  }

  private async checkOverlap(
    userId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const userSchedules: Schedule[] = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .innerJoin('schedule.enrollments', 'enrollment')
      .where('enrollment.userId = :userId', { userId })
      .andWhere('schedule.date = :date', { date })
      .andWhere('schedule.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .getMany();

    for (const schedule of userSchedules) {
      const existingStart: string = schedule.startTime;
      const existingEnd: string = schedule.endTime;

      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      ) {
        return true;
      }
    }
    return false;
  }

  
  private async checkAllDatesForConflicts(
    userId: number,
    startDateStr: string,
    daysOfWeek: number[],
    startTime: string,
    endTime: string,
    monthsToAdd: number = 6,
  ): Promise<{ hasConflicts: boolean; conflictDates: string[] }> {
    const conflictDates: string[] = [];
    const startDate = this.parseDate(startDateStr);
    const endDate = this.addMonths(startDate, monthsToAdd);

    let currentDate = new Date(startDate);

    console.log('========================================');
    console.log('🔍 CHECKING FOR CONFLICTS');
    console.log(`User ID: ${userId}`);
    console.log(`Start date: ${this.formatDate(startDate)}`);
    console.log(`End date: ${this.formatDate(endDate)}`);
    console.log(`Days of week: ${daysOfWeek.join(', ')}`);
    console.log(`Time: ${startTime} - ${endTime}`);
    console.log('========================================');

    while (this.isBeforeOrEqual(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();

      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = this.formatDate(currentDate);

        const hasOverlap = await this.checkOverlap(
          userId,
          dateStr,
          startTime,
          endTime,
        );

        if (hasOverlap) {
          conflictDates.push(dateStr);
          console.log(
            `❌ Conflict found: ${dateStr} (${['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dayOfWeek]})`,
          );
        } else {
          console.log(
            `✅ Free: ${dateStr} (${['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dayOfWeek]})`,
          );
        }
      }

      currentDate = this.addDays(currentDate, 1);
    }

    console.log('========================================');
    console.log(`Total conflicts: ${conflictDates.length}`);
    console.log('========================================');

    return {
      hasConflicts: conflictDates.length > 0,
      conflictDates,
    };
  }

  
  private async createIndividualSchedulesWithEnrollments(
    activityId: number,
    teacherId: number,
    userId: number,
    startDateStr: string,
    daysOfWeek: number[],
    startTime: string,
    endTime: string,
    durationMinutes: number,
    price: number,
  ): Promise<Schedule[]> {
    const schedules: Schedule[] = [];
    const startDate = this.parseDate(startDateStr);
    const endDate = this.addMonths(startDate, 6);

    let currentDate = new Date(startDate);
    let createdCount = 0;

    console.log('========================================');
    console.log('📅 CREATING INDIVIDUAL SCHEDULES WITH ENROLLMENTS');
    console.log(`Activity ID: ${activityId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Start date: ${this.formatDate(startDate)}`);
    console.log(`End date: ${this.formatDate(endDate)}`);
    console.log(`Days of week: ${daysOfWeek.join(', ')}`);
    console.log(`Time: ${startTime} - ${endTime}`);
    console.log('========================================');

    while (this.isBeforeOrEqual(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();

      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = this.formatDate(currentDate);

        const meetLink = this.generateMeetLink();

        
        const schedule = await this.scheduleService.createFromBooking(
          activityId,
          teacherId,
          dateStr,
          startTime,
          endTime,
          1,
          meetLink,
        );

        schedules.push(schedule);
        createdCount++;
        console.log(
          `✅ Created schedule: ${dateStr} (${['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dayOfWeek]})`,
        );

        
        const enrollment: Enrollment = this.enrollmentRepo.create({
          userId,
          activityId,
          scheduleId: schedule.id,
          isPaid: price === 0,
          paidAmount: price || 0,
        });
        await this.enrollmentRepo.save(enrollment);
        console.log(`✅ Created enrollment for: ${dateStr}`);

        
        schedule.enrolledCount += 1;
        await this.scheduleRepo.save(schedule);
      }

      currentDate = this.addDays(currentDate, 1);
    }

    console.log('========================================');
    console.log(`✅ Created: ${createdCount} schedules with enrollments`);
    console.log('========================================');

    return schedules;
  }

  
  private async createGroupSchedulesWithEnrollments(
    activityId: number,
    teacherId: number,
    userId: number,
    startDateStr: string,
    daysOfWeek: number[],
    startTime: string,
    endTime: string,
    period: string,
    price: number,
    maxStudents: number = 15,
  ): Promise<Schedule[]> {
    const schedules: Schedule[] = [];
    const startDate = this.parseDate(startDateStr);
    const monthsToAdd = period === 'год' ? 12 : 6;
    const endDate = this.addMonths(startDate, monthsToAdd);

    let currentDate = new Date(startDate);
    let createdCount = 0;

    console.log('========================================');
    console.log('📅 CREATING GROUP SCHEDULES WITH ENROLLMENTS');
    console.log(`Activity ID: ${activityId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Period: ${period}`);
    console.log(`Start date: ${this.formatDate(startDate)}`);
    console.log(`End date: ${this.formatDate(endDate)}`);
    console.log(`Days of week: ${daysOfWeek.join(', ')}`);
    console.log(`Time: ${startTime} - ${endTime}`);
    console.log('========================================');

    while (this.isBeforeOrEqual(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();

      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = this.formatDate(currentDate);

        const meetLink = this.generateMeetLink();

        
        const schedule = await this.scheduleService.createFromBooking(
          activityId,
          teacherId,
          dateStr,
          startTime,
          endTime,
          maxStudents,
          meetLink,
        );

        schedules.push(schedule);
        createdCount++;
        console.log(
          `✅ Created schedule: ${dateStr} (${['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dayOfWeek]})`,
        );

        
        const enrollment: Enrollment = this.enrollmentRepo.create({
          userId,
          activityId,
          scheduleId: schedule.id,
          isPaid: price === 0,
          paidAmount: price || 0,
        });
        await this.enrollmentRepo.save(enrollment);
        console.log(`✅ Created enrollment for: ${dateStr}`);

        
        schedule.enrolledCount += 1;
        await this.scheduleRepo.save(schedule);
      }

      currentDate = this.addDays(currentDate, 1);
    }

    console.log('========================================');
    console.log(`✅ Created: ${createdCount} schedules with enrollments`);
    console.log('========================================');

    return schedules;
  }

  async getActivities(
    language: Language = Language.RU,
  ): Promise<IActivityResponse[]> {
    const activities: Activity[] = await this.activityRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    const result: IActivityResponse[] = [];
    for (const activity of activities) {
      const stats: {
        rating: number;
        enrolledCount: number;
        reviewsCount: number;
      } = await this.computeActivityStats(activity.id);
      const translations: Record<string, string> =
        await this.translationService.getTranslations(
          'activity',
          activity.id,
          language,
        );

      result.push({
        id: activity.id,
        type: activity.type,
        title: translations.title || activity.title,
        description: translations.description || activity.description,
        teacher: activity.teacher,
        teacherAvatar: activity.teacherAvatar,
        duration: activity.duration,
        hourType: activity.hourType,
        price: activity.price,
        rating: stats.rating,
        enrolledCount: stats.enrolledCount,
        reviewsCount: stats.reviewsCount,
        categories: activity.categories || [],
        availableTimes: activity.availableTimes,
        availableSlots: activity.availableSlots,
        availableDates: activity.availableDates,
        availableAgeGroups: activity.availableAgeGroups,
        groupPeriod: activity.groupPeriod,
        groupShift: activity.groupShift,
        learningPlan: activity.learningPlan,
        targetAudience: activity.targetAudience,
      });
    }
    return result;
  }

  async getActivityById(
    id: number,
    language: Language = Language.RU,
  ): Promise<IActivityResponse | null> {
    const activity: Activity | null = await this.activityRepo.findOne({
      where: { id, isActive: true },
    });
    if (!activity) return null;

    const stats: {
      rating: number;
      enrolledCount: number;
      reviewsCount: number;
    } = await this.computeActivityStats(activity.id);
    const translations: Record<string, string> =
      await this.translationService.getTranslations(
        'activity',
        activity.id,
        language,
      );

    return {
      id: activity.id,
      type: activity.type,
      title: translations.title || activity.title,
      description: translations.description || activity.description,
      teacher: activity.teacher,
      teacherAvatar: activity.teacherAvatar,
      duration: activity.duration,
      hourType: activity.hourType,
      price: activity.price,
      rating: stats.rating,
      enrolledCount: stats.enrolledCount,
      reviewsCount: stats.reviewsCount,
      categories: activity.categories || [],
      availableTimes: activity.availableTimes,
      availableSlots: activity.availableSlots,
      availableDates: activity.availableDates,
      availableAgeGroups: activity.availableAgeGroups,
      groupPeriod: activity.groupPeriod,
      groupShift: activity.groupShift,
      learningPlan: activity.learningPlan,
      targetAudience: activity.targetAudience,
    };
  }

  async createIndividualSeries(
    activityId: number,
    userId: number,
    data: IIndividualScheduleData,
  ): Promise<any> {
    const activity: Activity | null = await this.activityRepo.findOne({
      where: { id: activityId, isActive: true },
    });
    if (!activity) throw new NotFoundException('Активность не найдена');

    const teacherId: number = data.teacherId || activity.teacherId || 0;
    if (!teacherId) {
      throw new BadRequestException('Не указан преподаватель для занятия');
    }

    if (!data.schedule || data.schedule.length === 0) {
      throw new BadRequestException('Не выбрано расписание занятий');
    }

    const durationMinutes = this.parseDurationToMinutes(activity.duration);
    const startTime: string = data.schedule[0].time;
    const endTime: string = this.calculateEndTime(startTime, durationMinutes);

    const selectedDays: number[] = data.schedule
      .map((item: { day: string; time: string }) => {
        return DAYS_OF_WEEK[item.day];
      })
      .filter((day: number): day is number => day !== undefined);

    if (selectedDays.length === 0) {
      throw new BadRequestException('Не выбраны дни недели');
    }

    console.log('=== Creating Individual Series ===');
    console.log(`Activity: ${activity.title}`);
    console.log(`Start date: ${data.startDate}`);
    console.log(`Days: ${selectedDays.join(', ')}`);
    console.log(`Time: ${startTime} - ${endTime}`);
    console.log(`Duration: ${durationMinutes} minutes`);

    
    const conflictCheck = await this.checkAllDatesForConflicts(
      userId,
      data.startDate,
      selectedDays,
      startTime,
      endTime,
      6,
    );

    
    if (conflictCheck.hasConflicts) {
      const conflictDatesStr = conflictCheck.conflictDates
        .slice(0, 5)
        .join(', ');
      const moreCount =
        conflictCheck.conflictDates.length > 5
          ? ` и еще ${conflictCheck.conflictDates.length - 5} дат`
          : '';

      throw new BadRequestException(
        `Невозможно создать расписание. Найдены пересечения с существующими занятиями в датах: ${conflictDatesStr}${moreCount}. Пожалуйста, выберите другое время или дни недели.`,
      );
    }

    
    const createdSchedules =
      await this.createIndividualSchedulesWithEnrollments(
        activityId,
        teacherId,
        userId,
        data.startDate,
        selectedDays,
        startTime,
        endTime,
        durationMinutes,
        activity.price || 0,
      );

    if (createdSchedules.length === 0) {
      throw new BadRequestException('Нет доступных дат для записи');
    }

    await this.notificationsService.create(
      userId,
      'Запись на занятия',
      `Вы успешно записаны на "${activity.title}" на ${createdSchedules.length} занятий`,
      NotificationType.BOOKING,
      '/dashboard/schedule',
    );

    return {
      success: true,
      schedules: createdSchedules,
      count: createdSchedules.length,
      message: `Создано ${createdSchedules.length} занятий`,
    };
  }

  async createGroupSeries(
    activityId: number,
    userId: number,
    data: IGroupScheduleData,
  ): Promise<any> {
    const activity: Activity | null = await this.activityRepo.findOne({
      where: { id: activityId, isActive: true },
    });
    if (!activity) throw new NotFoundException('Активность не найдена');

    const teacherId: number = activity.teacherId || 0;
    if (!teacherId) {
      throw new BadRequestException('Не указан преподаватель для занятия');
    }

    const shiftConfig: Record<string, { days: number[]; time: string }> = {
      утренняя: { days: [1, 3, 5], time: '10:00' },
      дневная: { days: [1, 3, 5], time: '14:00' },
      вечерняя: { days: [2, 4, 6], time: '18:00' },
    };

    const config: { days: number[]; time: string } | undefined =
      shiftConfig[data.shift];
    if (!config) throw new BadRequestException('Неверно указана смена');

    const durationMinutes = this.parseDurationToMinutes(activity.duration);
    const endTime: string = this.calculateEndTime(config.time, durationMinutes);

    const monthsToAdd = data.period === 'год' ? 12 : 6;

    console.log('=== Creating Group Series ===');
    console.log(`Activity: ${activity.title}`);
    console.log(`Start date: ${data.startDate}`);
    console.log(`Period: ${data.period}`);
    console.log(`Shift: ${data.shift}`);
    console.log(`Days: ${config.days.join(', ')}`);
    console.log(`Time: ${config.time} - ${endTime}`);

    
    const conflictCheck = await this.checkAllDatesForConflicts(
      userId,
      data.startDate,
      config.days,
      config.time,
      endTime,
      monthsToAdd,
    );

    
    if (conflictCheck.hasConflicts) {
      const conflictDatesStr = conflictCheck.conflictDates
        .slice(0, 5)
        .join(', ');
      const moreCount =
        conflictCheck.conflictDates.length > 5
          ? ` и еще ${conflictCheck.conflictDates.length - 5} дат`
          : '';

      throw new BadRequestException(
        `Невозможно создать расписание. Найдены пересечения с существующими занятиями в датах: ${conflictDatesStr}${moreCount}. Пожалуйста, выберите другое время или дни недели.`,
      );
    }

    
    const createdSchedules = await this.createGroupSchedulesWithEnrollments(
      activityId,
      teacherId,
      userId,
      data.startDate,
      config.days,
      config.time,
      endTime,
      data.period,
      activity.price || 0,
      15,
    );

    if (createdSchedules.length === 0) {
      throw new BadRequestException('Нет доступных дат для записи');
    }

    await this.notificationsService.create(
      userId,
      'Запись на занятия',
      `Вы успешно записаны на "${activity.title}" на ${createdSchedules.length} занятий`,
      NotificationType.BOOKING,
      '/dashboard/schedule',
    );

    return {
      success: true,
      schedules: createdSchedules,
      count: createdSchedules.length,
      message: `Создано ${createdSchedules.length} занятий`,
    };
  }

  async createSingleSchedule(
    activityId: number,
    userId: number,
    data: ISingleScheduleData,
  ): Promise<any> {
    const activity: Activity | null = await this.activityRepo.findOne({
      where: { id: activityId },
    });
    if (!activity) throw new NotFoundException('Активность не найдена');

    if (!data.time) {
      throw new BadRequestException('Не выбрано время занятия');
    }

    const teacherId: number = activity.teacherId || 0;
    if (!teacherId) {
      throw new BadRequestException('Не указан преподаватель для занятия');
    }

    const durationMinutes = this.parseDurationToMinutes(activity.duration);
    const endTime: string = this.calculateEndTime(data.time, durationMinutes);

    const hasOverlap: boolean = await this.checkOverlap(
      userId,
      data.date,
      data.time,
      endTime,
    );
    if (hasOverlap) {
      throw new BadRequestException('У вас уже есть занятие в это время');
    }

    const meetLink: string = this.generateMeetLink();
    const schedule: Schedule = await this.scheduleService.createFromBooking(
      activityId,
      teacherId,
      data.date,
      data.time,
      endTime,
      activity.type === ActivityType.INDIVIDUAL ? 1 : 20,
      meetLink,
    );

    const enrollment: Enrollment = this.enrollmentRepo.create({
      userId,
      activityId,
      scheduleId: schedule.id,
      isPaid: activity.price === 0,
      paidAmount: activity.price || 0,
    });
    await this.enrollmentRepo.save(enrollment);

    schedule.enrolledCount += 1;
    await this.scheduleRepo.save(schedule);

    await this.notificationsService.create(
      userId,
      'Запись на занятие',
      `Вы успешно записаны на "${activity.title}"`,
      NotificationType.BOOKING,
      '/dashboard/schedule',
    );

    return { success: true, schedule, enrollment };
  }

  async createBooking(
    activityId: number,
    userId: number | null,
    data: any,
  ): Promise<any> {
    if (!userId) {
      throw new ForbiddenException(
        'Для записи на занятие необходимо авторизоваться',
      );
    }

    const activity: Activity | null = await this.activityRepo.findOne({
      where: { id: activityId, isActive: true },
    });
    if (!activity) throw new NotFoundException('Активность не найдена');

    if (activity.price && activity.price > 0) {
      const balance: UserBalance | null = await this.balanceRepo.findOne({
        where: { userId },
      });
      if (!balance || balance.balance < activity.price) {
        throw new BadRequestException('Недостаточно средств на балансе');
      }
      balance.balance -= activity.price;
      await this.balanceRepo.save(balance);
    }

    let result: any;

    switch (activity.type) {
      case ActivityType.INDIVIDUAL:
        result = await this.createIndividualSeries(activityId, userId, data);
        break;
      case ActivityType.GROUP:
        result = await this.createGroupSeries(activityId, userId, data);
        break;
      default:
        result = await this.createSingleSchedule(activityId, userId, data);
        break;
    }

    return result;
  }

  async cancelSchedule(scheduleId: number, userId: number): Promise<void> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['enrollments'],
    });

    if (!schedule) {
      throw new NotFoundException('Занятие не найдено');
    }

    const enrollment = schedule.enrollments?.find((e) => e.userId === userId);
    if (!enrollment) {
      throw new ForbiddenException('Вы не записаны на это занятие');
    }

    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Занятие уже отменено');
    }

    schedule.status = ScheduleStatus.CANCELLED;
    await this.scheduleRepo.save(schedule);
  }

  async cancelAllSchedules(
    activityId: number,
    userId: number,
  ): Promise<{ cancelled: number }> {
    const schedules = await this.scheduleRepo
      .createQueryBuilder('s')
      .innerJoin('s.enrollments', 'e')
      .where('s.activityId = :activityId', { activityId })
      .andWhere('e.userId = :userId', { userId })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .andWhere('s.date >= :today', { today: this.formatDate(new Date()) })
      .getMany();

    if (schedules.length === 0) {
      throw new NotFoundException('Нет активных занятий для отмены');
    }

    for (const schedule of schedules) {
      schedule.status = ScheduleStatus.CANCELLED;
      await this.scheduleRepo.save(schedule);
    }

    return { cancelled: schedules.length };
  }

  async getUserSchedules(userId: number): Promise<Schedule[]> {
    const today = this.formatDate(new Date());

    return this.scheduleRepo
      .createQueryBuilder('s')
      .innerJoin('s.enrollments', 'e')
      .leftJoinAndSelect('s.activity', 'a')
      .leftJoinAndSelect('s.teacher', 't')
      .where('e.userId = :userId', { userId })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .andWhere('s.date >= :today', { today })
      .orderBy('s.date', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getMany();
  }

  async seedActivities(): Promise<{ message: string }> {
    return { message: 'Activities seeded successfully!' };
  }

  async getAllActivities(): Promise<Activity[]> {
    return this.activityRepo.find({ order: { order: 'ASC' } });
  }

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    if (data.duration) {
      data.durationMinutes = this.parseDurationToMinutes(data.duration);
    }
    const activity: Activity = this.activityRepo.create(data);
    return this.activityRepo.save(activity);
  }

  async updateActivity(
    id: number,
    data: Partial<Activity>,
  ): Promise<Activity | null> {
    if (data.duration) {
      data.durationMinutes = this.parseDurationToMinutes(data.duration);
    }
    await this.activityRepo.update(id, data);
    return this.activityRepo.findOne({ where: { id } });
  }

  async deleteActivity(id: number): Promise<void> {
    await this.activityRepo.delete(id);
  }

  

  
  async getTeacherAvailableSlots(
    teacherId: number,
    date: string,
    durationMinutes: number = 60,
  ): Promise<{ slots: string[]; date: string; teacherId: number }> {
    
    const workingHours = {
      start: 9, 
      end: 20, 
    };

    
    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException('Преподаватель не найден');
    }

    
    const existingSchedules = await this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.teacherId = :teacherId', { teacherId })
      .andWhere('s.date = :date', { date })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .orderBy('s.startTime', 'ASC')
      .getMany();

    const availableSlots: string[] = [];
    const slotDuration = durationMinutes;

    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const endMinutes = hour * 60 + minute + slotDuration;
        const endHour = Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        
        if (
          endHour > workingHours.end ||
          (endHour === workingHours.end && endMinute > 0)
        ) {
          break;
        }

        
        let isOccupied = false;
        for (const schedule of existingSchedules) {
          const existingStart = schedule.startTime;
          const existingEnd = schedule.endTime;

          if (
            (startTime >= existingStart && startTime < existingEnd) ||
            (endTime > existingStart && endTime <= existingEnd) ||
            (startTime <= existingStart && endTime >= existingEnd)
          ) {
            isOccupied = true;
            break;
          }
        }

        if (!isOccupied) {
          availableSlots.push(startTime);
        }
      }
    }

    return {
      slots: availableSlots,
      date,
      teacherId,
    };
  }

  
  async checkTeacherAvailability(
    teacherId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<{ available: boolean; conflictSchedule?: Schedule }> {
    const conflict = await this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.teacherId = :teacherId', { teacherId })
      .andWhere('s.date = :date', { date })
      .andWhere('s.status != :cancelled', {
        cancelled: ScheduleStatus.CANCELLED,
      })
      .andWhere('(s.startTime < :endTime AND s.endTime > :startTime)', {
        startTime,
        endTime,
      })
      .getOne();

    if (conflict) {
      return {
        available: false,
        conflictSchedule: conflict,
      };
    }

    return { available: true };
  }
}
