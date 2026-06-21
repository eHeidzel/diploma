import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MaterialsService } from '../services/materials.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@libs/shared';
import { Material, MaterialCategory } from '@entities/material.entity';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async findAll() {
    return this.materialsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.materialsService.findOne(id);
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: MaterialCategory) {
    return this.materialsService.findByCategory(category);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async create(@Body() data: any) {
    return this.materialsService.create(data);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: number, @Body() data: any) {
    return this.materialsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: number) {
    await this.materialsService.delete(id);
    return { success: true };
  }
}
