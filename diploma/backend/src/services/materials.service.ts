
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material, MaterialCategory } from '../entities/material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,
  ) {}

  async findAll(): Promise<Material[]> {
    return this.materialRepo.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Material | null> {
    return this.materialRepo.findOne({ where: { id, isActive: true } });
  }

  async findByCategory(category: MaterialCategory): Promise<Material[]> {
    return this.materialRepo.find({
      where: { category, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async create(data: Partial<Material>): Promise<Material> {
    const material = this.materialRepo.create(data);
    return this.materialRepo.save(material);
  }

  async update(id: number, data: Partial<Material>): Promise<Material | null> {
    await this.materialRepo.update(id, data);
    return this.materialRepo.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.materialRepo.delete(id);
  }

  async seedMaterials(): Promise<void> {
    await this.materialRepo.clear();

    const materials = [
      {
        title: 'Методические материалы для преподавателей',
        link: 'https://drive.google.com/drive/folders/teachers-methods',
        category: MaterialCategory.GENERAL,
        order: 1,
      },
      {
        title: 'Презентации по Frontend',
        link: 'https://drive.google.com/drive/folders/frontend-slides',
        category: MaterialCategory.FRONTEND,
        order: 2,
      },
      {
        title: 'Презентации по Backend',
        link: 'https://drive.google.com/drive/folders/backend-slides',
        category: MaterialCategory.BACKEND,
        order: 3,
      },
      {
        title: 'Практические задания',
        link: 'https://drive.google.com/drive/folders/practice-tasks',
        category: MaterialCategory.GENERAL,
        order: 4,
      },
    ];

    for (const material of materials) {
      await this.materialRepo.save(material);
    }
  }
}
