import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { Review } from '../entities/review.entity';
import { UserRole } from 'src/enums/UserRole.enums';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async getStatistics() {
    const satisfiedStudents = await this.userRepo.count({
      where: { role: UserRole.STUDENT },
    });

    const experiencedTeachers = await this.userRepo.count({
      where: { role: UserRole.TEACHER },
    });

    const successfulProjects = await this.projectRepo.count({
      where: { isActive: true },
    });

    const totalReviews = await this.reviewRepo.count({
      where: { isActive: true },
    });

    const averageRating = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.isActive = :isActive', { isActive: true })
      .getRawOne();

    return [
      {
        id: 1,
        title: 'Довольных студентов',
        value: satisfiedStudents,
        suffix: '',
      },
      {
        id: 2,
        title: 'Опытных преподавателей',
        value: experiencedTeachers,
        suffix: '',
      },
      {
        id: 3,
        title: 'Успешных проектов',
        value: successfulProjects,
        suffix: '',
      },
    ];
  }

  async getExtendedStatistics() {
    const [
      totalStudents,
      totalTeachers,
      totalProjects,
      totalReviews,
      averageRating,
      activeProjects,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.STUDENT } }),
      this.userRepo.count({ where: { role: UserRole.TEACHER } }),
      this.projectRepo.count({ where: { isActive: true } }),
      this.reviewRepo.count({ where: { isActive: true } }),
      this.reviewRepo
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .where('review.isActive = :isActive', { isActive: true })
        .getRawOne(),
      this.projectRepo.count({ where: { isActive: true } }),
    ]);

    return {
      students: totalStudents,
      teachers: totalTeachers,
      projects: totalProjects,
      reviews: totalReviews,
      averageRating: parseFloat(averageRating?.average || 0).toFixed(1),
      activeProjects,
    };
  }
}
