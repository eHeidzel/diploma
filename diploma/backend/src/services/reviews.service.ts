
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { UserRole } from 'src/enums/UserRole.enums';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { isActive: true },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review | null> {
    return this.reviewRepo.findOne({
      where: { id, isActive: true },
    });
  }

  async createUserReview(
    userId: number,
    rating: number,
    text: string,
  ): Promise<Review> {
    const existingReview = await this.reviewRepo.findOne({
      where: { userId, isActive: true },
    });

    if (existingReview) {
      throw new ForbiddenException('Вы уже оставляли отзыв о школе');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const review = this.reviewRepo.create({
      name: user.name,
      role: 'Ученик',
      company: 'CodeZone',
      avatar: user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      rating,
      text,
      userId: userId,
      date: new Date(),
      isActive: true,
    });

    return this.reviewRepo.save(review);
  }

  async createAdminReview(data: any): Promise<Review> {
    const review = this.reviewRepo.create({
      name: data.name,
      role: data.role,
      company: data.company,
      avatar: data.avatar,
      rating: data.rating,
      text: data.text,
      userId: data.userId || undefined,
      date: new Date(),
      isActive: true,
    });

    return this.reviewRepo.save(review);
  }

  async updateReview(
    reviewId: number,
    userId: number,
    userRole: UserRole,
    rating: number,
    text: string,
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, isActive: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    const isAuthor = review.userId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException(
        'Вы можете редактировать только свои отзывы',
      );
    }

    review.rating = rating;
    review.text = text;
    review.date = new Date();

    return this.reviewRepo.save(review);
  }

  async deleteReview(
    reviewId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<void> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, isActive: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    const isAuthor = review.userId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Вы можете удалять только свои отзывы');
    }

    review.isActive = false;
    await this.reviewRepo.save(review);
  }

  async getMyReview(userId: number): Promise<Review | null> {
    return this.reviewRepo.findOne({
      where: { userId, isActive: true },
    });
  }

  async seedReviews() {
    await this.reviewRepo.clear();

    const reviews = [
      {
        name: 'Анна Смирнова',
        role: 'Frontend-разработчик',
        company: 'Яндекс',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        rating: 5,
        text: 'Отличная школа! После курсов сразу нашла работу в крупной IT-компании. Преподаватели объясняют сложные вещи простым языком.',
        date: new Date('2024-03-15'),
        isActive: true,
        userId: undefined,
      },
      {
        name: 'Дмитрий Иванов',
        role: 'Fullstack-разработчик',
        company: 'Tinkoff',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        rating: 5,
        text: 'Лучшие курсы по программированию! Материал подаётся структурированно, много практики.',
        date: new Date('2024-02-10'),
        isActive: true,
        userId: undefined,
      },
      {
        name: 'Елена Петрова',
        role: 'Data Scientist',
        company: 'Сбер',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        rating: 4,
        text: 'Хорошая школа, но хотелось бы больше проектов по Data Science. В остальном всё отлично.',
        date: new Date('2024-01-20'),
        isActive: true,
        userId: undefined,
      },
    ];

    for (const review of reviews) {
      await this.reviewRepo.save(review);
    }

    return { message: 'Reviews seeded successfully!' };
  }
}
