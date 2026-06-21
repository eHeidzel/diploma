import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async seedProjects() {
    await this.projectRepo.clear();

    const projects = [
      {
        title: 'E-commerce платформа',
        description:
          'Полноценный интернет-магазин с корзиной, оплатой и админ-панелью',
        studentName: 'Иван Петров',
        studentRole: 'Fullstack Developer',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        image:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
        githubLink: 'https://github.com/student/ecommerce',
        demoLink: 'https://ecommerce-demo.com',
        rating: 4.8,
        isActive: true,
      },
      {
        title: 'Task Manager App',
        description:
          'Приложение для управления задачами с возможностью командной работы',
        studentName: 'Екатерина Сидорова',
        studentRole: 'Frontend Developer',
        technologies: ['React', 'Redux', 'Firebase', 'Material-UI'],
        image:
          'https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=400',
        githubLink: 'https://github.com/student/taskmanager',
        demoLink: 'https://taskmanager-demo.com',
        rating: 4.9,
        isActive: true,
      },
      {
        title: 'Аналитическая панель',
        description: 'Дашборд для анализа данных с интерактивными графиками',
        studentName: 'Михаил Кузнецов',
        studentRole: 'Data Scientist',
        technologies: ['Python', 'Django', 'Plotly', 'Pandas'],
        image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        githubLink: 'https://github.com/student/analytics',
        demoLink: 'https://analytics-demo.com',
        rating: 4.7,
        isActive: true,
      },
      {
        title: 'Мобильное приложение для фитнеса',
        description: 'Приложение для отслеживания тренировок и питания',
        studentName: 'Анна Морозова',
        studentRole: 'Mobile Developer',
        technologies: ['React Native', 'Node.js', 'MongoDB'],
        image:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        githubLink: 'https://github.com/student/fitness',
        demoLink: 'https://fitness-demo.com',
        rating: 5.0,
        isActive: true,
      },
    ];

    for (const project of projects) {
      await this.projectRepo.save(project);
    }

    return { message: 'Projects seeded successfully!' };
  }
}
