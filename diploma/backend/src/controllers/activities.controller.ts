import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from '../services/activities.service';
import { Language } from '@libs/shared';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async getActivities(@Query('lang') language: Language = Language.RU) {
    return this.activitiesService.getActivities(language);
  }

  @Get(':id')
  async getActivityById(
    @Param('id') id: number,
    @Query('lang') language: Language = Language.RU,
  ) {
    return this.activitiesService.getActivityById(id, language);
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body()
    body: {
      activityId: number;
      schedule?: any;
      ageGroup?: string;
      startDate?: string;
      time?: string;
      period?: string;
      shift?: string;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.activitiesService.createBooking(body.activityId, userId, body);
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedActivities() {
    return this.activitiesService.seedActivities();
  }

  @Get('teacher/:teacherId/available-slots')
  @UseGuards(JwtAuthGuard)
  async getTeacherAvailableSlots(
    @Param('teacherId') teacherId: number,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    const durationMinutes = duration ? parseInt(duration, 10) : 60;
    return this.activitiesService.getTeacherAvailableSlots(
      teacherId,
      date,
      durationMinutes,
    );
  }

  @Get('teacher/:teacherId/check-availability')
  @UseGuards(JwtAuthGuard)
  async checkTeacherAvailability(
    @Param('teacherId') teacherId: number,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.activitiesService.checkTeacherAvailability(
      teacherId,
      date,
      startTime,
      endTime,
    );
  }
}
