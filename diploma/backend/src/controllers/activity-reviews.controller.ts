import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivityReviewsService } from '../services/activity-reviews.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'src/enums/UserRole.enums';

@Controller('activities/:activityId/reviews')
@UseGuards(JwtAuthGuard)
export class ActivityReviewsController {
  constructor(private readonly reviewsService: ActivityReviewsService) {}

  @Get()
  async getReviews(@Param('activityId') activityId: number) {
    return this.reviewsService.getReviews(activityId);
  }

  @Get('my')
  async getMyReview(
    @Param('activityId') activityId: number,
    @Request() req: any,
  ) {
    return this.reviewsService.getMyReview(activityId, req.user.id);
  }

  @Post()
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async createReview(
    @Param('activityId') activityId: number,
    @Body() body: { rating: number; text: string },
    @Request() req: any,
  ) {
    return this.reviewsService.createReview(
      activityId,
      req.user.id,
      body.rating,
      body.text,
    );
  }

  @Put(':reviewId')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async updateReview(
    @Param('activityId') activityId: number,
    @Param('reviewId') reviewId: number,
    @Body() body: { rating: number; text: string },
    @Request() req: any,
  ) {
    console.log(
      `Updating review ${reviewId} for activity ${activityId} by user ${req.user.id}`,
    );
    return this.reviewsService.updateReview(
      reviewId,
      req.user.id,
      body.rating,
      body.text,
    );
  }

  @Delete(':reviewId')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('activityId') activityId: number,
    @Param('reviewId') reviewId: number,
    @Request() req: any,
  ) {
    console.log(
      `Deleting review ${reviewId} for activity ${activityId} by user ${req.user.id}`,
    );
    await this.reviewsService.deleteReview(reviewId, req.user.id);
  }
}
