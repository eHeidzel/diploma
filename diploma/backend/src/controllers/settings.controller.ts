import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.id);
  }

  @Put()
  async updateSettings(@Request() req: any, @Body() data: any) {
    return this.settingsService.updateSettings(req.user.id, data);
  }

  @Put('notifications')
  async updateNotificationSettings(@Request() req: any, @Body() data: any) {
    return this.settingsService.updateNotificationSettings(req.user.id, data);
  }

  @Put('privacy')
  async updatePrivacySettings(@Request() req: any, @Body() data: any) {
    return this.settingsService.updatePrivacySettings(req.user.id, data);
  }
}
