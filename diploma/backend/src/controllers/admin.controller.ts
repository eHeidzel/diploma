import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@libs/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('users/teachers')
  getTeachers() {
    return this.adminService.getTeachers();
  }

  @Post('users/teacher')
  createTeacher(@Body() data: any) {
    return this.adminService.createTeacher(data);
  }

  @Put('users/:id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/block')
  blockUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isBlocked: boolean; reason?: string; until?: string },
  ) {
    return this.adminService.blockUser(
      id,
      body.isBlocked,
      body.reason,
      body.until,
    );
  }

  @Get('blacklist')
  getBlacklist() {
    return this.adminService.getBlacklist();
  }

  @Get('teacher-requests')
  getTeacherRequests() {
    return this.adminService.getTeacherRequests();
  }

  @Patch('teacher-requests/:id')
  processTeacherRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    return this.adminService.processTeacherRequest(id, body.status);
  }

  @Get('activities')
  getActivities() {
    return this.adminService.getActivities();
  }

  @Post('activities')
  createActivity(@Body() data: any) {
    return this.adminService.createActivity(data);
  }

  @Put('activities/:id')
  updateActivity(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateActivity(id, data);
  }

  @Delete('activities/:id')
  deleteActivity(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteActivity(id);
  }

  @Get('schedule')
  getSchedule() {
    return this.adminService.getSchedule();
  }

  @Post('schedule')
  createSchedule(@Body() data: any) {
    return this.adminService.createSchedule(data);
  }

  @Put('schedule/:id')
  updateSchedule(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateSchedule(id, data);
  }

  @Delete('schedule/:id')
  deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSchedule(id);
  }

  @Get('access')
  getAccesses() {
    return this.adminService.getAccesses();
  }

  @Get('access/teacher/:teacherId')
  getAccessByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.adminService.getAccessByTeacher(teacherId);
  }

  @Post('access')
  grantAccess(
    @Body()
    body: {
      teacherId: number;
      category: string;
      googleDriveLink: string;
    },
  ) {
    return this.adminService.grantAccess(body);
  }

  @Put('access/:id')
  updateAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { category?: string; googleDriveLink?: string },
  ) {
    return this.adminService.updateAccess(id, body);
  }

  @Delete('access/:id')
  revokeAccess(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.revokeAccess(id);
  }

  @Get('schedule-requests')
  getScheduleRequests() {
    return this.adminService.getScheduleRequests();
  }

  @Get('schedule-requests/pending')
  getPendingScheduleRequests() {
    return this.adminService.getPendingScheduleRequests();
  }

  @Get('schedule-requests/:id')
  getScheduleRequest(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getScheduleRequest(id);
  }

  @Patch('schedule-requests/:id/approve')
  approveScheduleRequest(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveScheduleRequest(id);
  }

  @Patch('schedule-requests/:id/reject')
  rejectScheduleRequest(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectScheduleRequest(id);
  }

  @Delete('schedule-requests/:id')
  deleteScheduleRequest(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteScheduleRequest(id);
  }
}
