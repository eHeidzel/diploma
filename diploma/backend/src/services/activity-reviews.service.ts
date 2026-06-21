
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityReview } from '../entities/activity-review.entity';
import { Enrollment } from '../entities/enrollment.entity';

@Injectable()
export class ActivityReviewsService {
  constructor(
    @InjectRepository(ActivityReview)
    private reviewRepo: Repository<ActivityReview>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  async getReviews(activityId: number): Promise<any[]> {
    const reviews = await this.reviewRepo.find({
      where: { activityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      userName: review.user.name,
      userAvatar: review.user.avatar,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
    }));
  }

  async getMyReview(activityId: number, userId: number): Promise<any | null> {
    const review = await this.reviewRepo.findOne({
      where: { activityId, userId },
    });
    return review;
  }

  async getReviewById(reviewId: number): Promise<ActivityReview | null> {
    return this.reviewRepo.findOne({
      where: { id: reviewId },
    });
  }

  async createReview(
    activityId: number,
    userId: number,
    rating: number,
    text: string,
  ): Promise<ActivityReview> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, activityId },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Вы можете оставить отзыв только после записи на занятие',
      );
    }

    const existingReview = await this.reviewRepo.findOne({
      where: { activityId, userId },
    });

    if (existingReview) {
      throw new ForbiddenException('Вы уже оставили отзыв на это занятие');
    }

    const review = this.reviewRepo.create({
      userId,
      activityId,
      rating,
      text,
    });

    return this.reviewRepo.save(review);
  }

  async updateReview(
    reviewId: number,
    userId: number,
    rating: number,
    text: string,
  ): Promise<ActivityReview> {
    console.log(`Looking for review ${reviewId} for user ${userId}`);

    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      console.log(`Review ${reviewId} not found for user ${userId}`);
      throw new NotFoundException('Отзыв не найден');
    }

    console.log(`Found review ${reviewId}, updating...`);
    review.rating = rating;
    review.text = text;
    const saved = await this.reviewRepo.save(review);
    console.log(`Review ${reviewId} updated successfully`);

    return saved;
  }

  async deleteReview(reviewId: number, userId: number): Promise<void> {
    console.log(`Looking for review ${reviewId} for user ${userId} to delete`);

    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      console.log(`Review ${reviewId} not found for user ${userId}`);
      throw new NotFoundException('Отзыв не найден');
    }

    console.log(`Found review ${reviewId}, deleting...`);
    await this.reviewRepo.delete(reviewId);
    console.log(`Review ${reviewId} deleted successfully`);
  }

  async checkEnrollment(activityId: number, userId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, activityId },
    });
    return !!enrollment;
  }
}
