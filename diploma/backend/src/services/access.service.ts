
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccess } from '../entities/user-access.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(UserAccess)
    private accessRepo: Repository<UserAccess>,
  ) {}

  async getAllAccesses(): Promise<UserAccess[]> {
    return this.accessRepo.find({
      relations: ['user', 'teacher'],
    });
  }

  async getAccessByUser(userId: number): Promise<UserAccess[]> {
    return this.accessRepo.find({
      where: { userId },
      relations: ['user', 'teacher'],
    });
  }

  async grantAccess(data: {
    userId: number;
    teacherId: number;
    category: string;
    googleDriveLink: string;
  }): Promise<UserAccess> {
    const access = this.accessRepo.create({
      userId: data.userId,
      teacherId: data.teacherId,
      category: data.category,
      googleDriveLink: data.googleDriveLink,
    });
    return this.accessRepo.save(access);
  }

  async revokeAccess(id: number): Promise<void> {
    const access = await this.accessRepo.findOne({ where: { id } });
    if (!access) {
      throw new NotFoundException('Доступ не найден');
    }
    await this.accessRepo.delete(id);
  }

  async getAccessByTeacher(teacherId: number): Promise<UserAccess[]> {
    return this.accessRepo.find({
      where: { teacherId },
      relations: ['user', 'teacher'],
    });
  }

  async checkUserAccess(
    userId: number,
    teacherId: number,
    category: string,
  ): Promise<boolean> {
    const access = await this.accessRepo.findOne({
      where: {
        userId,
        teacherId,
        category,
      },
    });
    return !!access;
  }
}
