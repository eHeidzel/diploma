import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { ActivitiesService } from '../services/activities.service';
import { Schedule } from '../entities/schedule.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'src/enums/UserRole.enums';

@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() scheduleData: Partial<Schedule>) {
    return this.scheduleService.create(scheduleData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Get('teacher/:teacherId')
  @UseGuards(JwtAuthGuard)
  async findByTeacher(@Param('teacherId') teacherId: number) {
    return this.scheduleService.findByTeacher(teacherId);
  }

  @Get('activity/:activityId')
  @UseGuards(JwtAuthGuard)
  async findByActivity(@Param('activityId') activityId: number) {
    return this.scheduleService.findByActivity(activityId);
  }

  @Get('student/my')
  @UseGuards(JwtAuthGuard)
  async getMySchedule(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return [];
    }
    return this.activitiesService.getUserSchedules(userId);
  }

  @Get('available/:activityId')
  @UseGuards(JwtAuthGuard)
  async getAvailableSchedules(@Param('activityId') activityId: number) {
    return this.scheduleService.getAvailableSchedules(activityId);
  }

  @Post('enroll/:scheduleId')
  @UseGuards(JwtAuthGuard)
  async enroll(@Param('scheduleId') scheduleId: number, @Request() req: any) {
    const userId = req.user?.id;
    return this.scheduleService.enrollInSchedule(scheduleId, userId);
  }

  @Delete('cancel/:scheduleId')
  @UseGuards(JwtAuthGuard)
  async cancelEnrollment(
    @Param('scheduleId') scheduleId: number,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.activitiesService.cancelSchedule(scheduleId, userId);
  }

  @Post('cancel-all/:activityId')
  @UseGuards(JwtAuthGuard)
  async cancelAllSchedules(
    @Param('activityId') activityId: number,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.activitiesService.cancelAllSchedules(activityId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return this.scheduleService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() scheduleData: Partial<Schedule>,
  ) {
    return this.scheduleService.update(id, scheduleData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: number) {
    return this.scheduleService.remove(id);
  }

  @Get(':scheduleId/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getEnrolledStudents(@Param('scheduleId') scheduleId: number) {
    return this.scheduleService.getEnrolledStudents(scheduleId);
  }

  @Get('check-enrollment/:activityId')
  @UseGuards(JwtAuthGuard)
  async checkEnrollment(
    @Param('activityId') activityId: number,
    @Request() req: any,
  ) {
    return this.scheduleService.checkEnrollment(activityId, req.user.id);
  }
}
