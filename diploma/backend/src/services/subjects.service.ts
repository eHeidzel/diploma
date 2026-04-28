import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '@entities/subject.entity';
import { Enrollment } from '@entities/enrollment.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async create(subjectData: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectsRepository.create(subjectData);
    return await this.subjectsRepository.save(subject);
  }

  async findAll(): Promise<Subject[]> {
    return await this.subjectsRepository.find();
  }

  async findOne(id: number): Promise<Subject | null> {
    return await this.subjectsRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    subjectData: Partial<Subject>,
  ): Promise<Subject | null> {
    await this.subjectsRepository.update(id, subjectData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.subjectsRepository.delete(id);
  }

  async enrollStudent(userId: number, subjectId: number): Promise<Enrollment> {
    const enrollment = this.enrollmentsRepository.create({ userId, subjectId });
    return await this.enrollmentsRepository.save(enrollment);
  }

  async getUserSubjects(userId: number): Promise<Subject[]> {
    const enrollments = await this.enrollmentsRepository.find({
      where: { userId },
      relations: ['subject'],
    });
    return enrollments.map((e) => e.subject);
  }

  async getTeacherSubjects(teacherId: number): Promise<Subject[]> {
    const schedules = await this.subjectsRepository
      .createQueryBuilder('subject')
      .innerJoin('subject.schedules', 'schedule')
      .where('schedule.teacherId = :teacherId', { teacherId })
      .getMany();
    return schedules;
  }
}
