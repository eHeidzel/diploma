
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    link?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId,
      title,
      message,
      type,
      link,
    });
    const saved = await this.notificationRepo.save(notification);

    
    this.notificationsGateway.sendNotificationToUser(userId, saved);

    
    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.sendUnreadCountUpdate(userId, unreadCount);

    return saved;
  }

  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
    const notification = await this.notificationRepo.findOne({ where: { id } });

    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.sendUnreadCountUpdate(userId, unreadCount);

    return notification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    this.notificationsGateway.sendUnreadCountUpdate(userId, 0);
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.notificationRepo.delete({ id, userId });
    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.sendUnreadCountUpdate(userId, unreadCount);
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }
}
