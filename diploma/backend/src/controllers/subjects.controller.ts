import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubjectsService } from '@services/subjects.service';
import { Subject } from '@entities/subject.entity';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Body() subjectData: Partial<Subject>): Promise<Subject> {
    return this.subjectsService.create(subjectData);
  }

  @Get()
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Subject | null> {
    return this.subjectsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() subjectData: Partial<Subject>,
  ): Promise<Subject | null> {
    return this.subjectsService.update(+id, subjectData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.subjectsService.remove(+id);
  }

  @Post(':subjectId/enroll/:userId')
  enroll(
    @Param('subjectId') subjectId: string,
    @Param('userId') userId: string,
  ) {
    return this.subjectsService.enrollStudent(+userId, +subjectId);
  }

  @Get('user/:userId')
  getUserSubjects(@Param('userId') userId: string) {
    return this.subjectsService.getUserSubjects(+userId);
  }
}
