// services/settings.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../entities/user-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private settingsRepo: Repository<UserSettings>,
  ) {}

  async getSettings(userId: number): Promise<UserSettings> {
    let settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepo.create({ userId });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(
    userId: number,
    data: Partial<UserSettings>,
  ): Promise<UserSettings> {
    let settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepo.create({ userId });
    }
    Object.assign(settings, data);
    await this.settingsRepo.save(settings);
    return settings;
  }

  async updateLanguage(
    userId: number,
    language: string,
  ): Promise<UserSettings> {
    return this.updateSettings(userId, { language });
  }

  async updateNotificationsEnabled(
    userId: number,
    enabled: boolean,
  ): Promise<UserSettings> {
    return this.updateSettings(userId, { notificationsEnabled: enabled });
  }
}