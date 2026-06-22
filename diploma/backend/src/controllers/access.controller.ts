import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AccessService } from '../services/access.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'src/enums/UserRole.enums';

@Controller('admin/access')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get()
  async getAllAccesses() {
    return this.accessService.getAllAccesses();
  }

  @Get('user/:userId')
  async getAccessByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.accessService.getAccessByUser(userId);
  }

  @Post()
  async grantAccess(
    @Body()
    body: {
      userId: number;
      teacherId: number;
      category: string;
      googleDriveLink: string;
    },
  ) {
    return this.accessService.grantAccess({
      userId: body.userId,
      teacherId: body.teacherId,
      category: body.category,
      googleDriveLink: body.googleDriveLink,
    });
  }

  @Delete(':id')
  async revokeAccess(@Param('id', ParseIntPipe) id: number) {
    await this.accessService.revokeAccess(id);
    return { message: 'Доступ отозван' };
  }
}
