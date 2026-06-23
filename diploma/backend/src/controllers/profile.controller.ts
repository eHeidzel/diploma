import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from '../services/profile.service';
import { BalanceService } from '../services/balance.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly balanceService: BalanceService,
  ) {}

  @Get()
  async getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  async updateProfile(@Request() req: any, @Body() data: any) {
    return this.profileService.updateProfile(req.user.id, data);
  }

  @Post('change-password')
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.profileService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
    return { success: true };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${req.user.id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;
    await this.profileService.updateAvatar(req.user.id, avatarUrl);

    const baseUrl = process.env.BASE_URL || 'https://codezone1.vercel.app';
    return { avatar: `${baseUrl}${avatarUrl}` };
  }

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.balanceService.getBalance(req.user.id);
  }
}
