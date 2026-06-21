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
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@libs/shared';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.reviewsService.findOne(id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyReview(@Request() req: any) {
    return this.reviewsService.getMyReview(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async create(
    @Body() body: { rating: number; text: string },
    @Request() req: any,
  ) {
    return this.reviewsService.createUserReview(
      req.user.id,
      body.rating,
      body.text,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() body: { rating: number; text: string },
    @Request() req: any,
  ) {
    return this.reviewsService.updateReview(
      id,
      req.user.id,
      req.user.role,
      body.rating,
      body.text,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number, @Request() req: any) {
    await this.reviewsService.deleteReview(id, req.user.id, req.user.role);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createAdmin(@Body() body: any) {
    return this.reviewsService.createAdminReview(body);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seed() {
    return this.reviewsService.seedReviews();
  }
}
