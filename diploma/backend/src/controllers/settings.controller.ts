// controllers/settings.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
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

  @Put('language')
  async updateLanguage(
    @Request() req: any,
    @Body() body: { language: string },
  ) {
    return this.settingsService.updateLanguage(req.user.id, body.language);
  }

  @Put('notifications')
  async updateNotifications(
    @Request() req: any,
    @Body() body: { enabled: boolean },
  ) {
    return this.settingsService.updateNotificationsEnabled(
      req.user.id,
      body.enabled,
    );
  }
}