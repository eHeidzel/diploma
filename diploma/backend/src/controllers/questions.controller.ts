import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';
import { Language, IUserAnswer } from '@libs/shared';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getQuestions(@Query('lang') language: Language = Language.RU) {
    return this.questionsService.getQuestions(language);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculateResults(
    @Body() body: { answers: IUserAnswer[]; lang?: Language },
    @Query('lang') queryLang: Language = Language.RU,
  ) {
    const language = body.lang || queryLang;
    return this.questionsService.calculateResults(body.answers, language);
  }

  @Get('seed')
  @HttpCode(HttpStatus.OK)
  async seedQuestions() {
    await this.questionsService.seedDirections();
    return { message: 'Aaaa seeded successfully!' };
  }

  @Get('directions')
  async getDirections(@Query('lang') language: Language = Language.RU) {
    return this.questionsService.getAvailableDirections(language);
  }

  @Get(':id')
  async getQuestionById(
    @Query('id') id: number,
    @Query('lang') language: Language = Language.RU,
  ) {
    return this.questionsService.getQuestionById(id, language);
  }
}
