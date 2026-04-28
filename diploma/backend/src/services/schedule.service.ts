import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '@entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async create(scheduleData: Partial<Schedule>): Promise<Schedule> {
    const schedule = this.scheduleRepository.create(scheduleData);
    return await this.scheduleRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      relations: ['subject', 'teacher'],
    });
  }

  async findOne(id: number): Promise<Schedule | null> {
    return await this.scheduleRepository.findOne({
      where: { id },
      relations: ['subject', 'teacher'],
    });
  }

  async findByTeacher(teacherId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { teacherId },
      relations: ['subject', 'teacher'],
    });
  }

  async findBySubject(subjectId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { subjectId },
      relations: ['subject', 'teacher'],
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
    return await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.subject', 'subject')
      .innerJoin('subject.enrollments', 'enrollment')
      .where('enrollment.userId = :studentId', { studentId })
      .innerJoinAndSelect('schedule.subject', 'subject')
      .innerJoinAndSelect('schedule.teacher', 'teacher')
      .getMany();
  }
}
