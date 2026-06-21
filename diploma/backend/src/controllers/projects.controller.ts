import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seed() {
    return this.projectsService.seedProjects();
  }
}
