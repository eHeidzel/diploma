import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ScheduleRequestsService } from '../services/schedule-requests.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { RequestType } from '../entities/schedule-request.entity';
import { UserRole } from '@libs/shared';

@Controller('schedule-requests')
@UseGuards(JwtAuthGuard)
export class ScheduleRequestsController {
  constructor(
    private readonly scheduleRequestsService: ScheduleRequestsService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllRequests() {
    return this.scheduleRequestsService.getAllRequests();
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingRequests() {
    return this.scheduleRequestsService.getPendingRequests();
  }

  @Get('user/:userId')
  async getRequestsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.scheduleRequestsService.getRequestsByUser(userId);
  }

  @Get(':id')
  async getRequestById(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleRequestsService.getRequestById(id);
  }

  @Post()
  async createRequest(
    @Request() req,
    @Body()
    body: {
      scheduleId: number;
      requestType: RequestType;
      reason: string;
      proposedDate?: string;
      proposedTime?: string;
    },
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new BadRequestException(
        'Только преподаватели могут создавать запросы',
      );
    }

    return this.scheduleRequestsService.createRequest(req.user.id, body);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveRequest(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleRequestsService.approveRequest(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectRequest(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleRequestsService.rejectRequest(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteRequest(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleRequestsService.deleteRequest(id);
    return { message: 'Запрос удален' };
  }
}
