import {
  Controller,
  Get,
  Query,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WorkloadService } from '../services/workload.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@libs/shared';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class WorkloadController {
  constructor(private readonly workloadService: WorkloadService) {}

  @Get('workload')
  async getWorkload(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.workloadService.getWorkload(req.user.id, startDate, endDate);
  }

  @Get('students')
  async getMyStudents(@Request() req: any) {
    return this.workloadService.getMyStudents(req.user.id);
  }

  @Get('students/:studentId')
  async getStudentProfile(
    @Param('studentId') studentId: number,
    @Request() req: any,
  ) {
    return this.workloadService.getStudentProfile(req.user.id, studentId);
  }

  @Get('groups')
  async getMyGroups(@Request() req: any) {
    return this.workloadService.getMyGroups(req.user.id);
  }
}
