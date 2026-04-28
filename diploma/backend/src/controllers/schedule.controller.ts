import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ScheduleService } from '@services/schedule.service';
import { Schedule } from '@entities/schedule.entity';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() scheduleData: Partial<Schedule>): Promise<Schedule> {
    return this.scheduleService.create(scheduleData);
  }

  @Get()
  findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Schedule | null> {
    return this.scheduleService.findOne(+id);
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string): Promise<Schedule[]> {
    return this.scheduleService.findByTeacher(+teacherId);
  }

  @Get('student/:studentId')
  getStudentSchedule(
    @Param('studentId') studentId: string,
  ): Promise<Schedule[]> {
    return this.scheduleService.getStudentSchedule(+studentId);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string): Promise<Schedule[]> {
    return this.scheduleService.findBySubject(+subjectId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() scheduleData: Partial<Schedule>,
  ): Promise<Schedule | null> {
    return this.scheduleService.update(+id, scheduleData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.scheduleService.remove(+id);
  }
}
