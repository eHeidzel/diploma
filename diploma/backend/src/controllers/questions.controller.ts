import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';
import { Language } from 'src/enums/Language.enums';

// Тип для ответа пользователя
interface IUserAnswer {
  questionId: number;
  selectedOptionId: number;
}

// Тип для тела запроса calculateResults
interface ICalculateResultsBody {
  answers: IUserAnswer[];
  lang?: Language;
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getQuestions(
    @Query('lang') language: Language = Language.RU,
  ): Promise<any[]> {
    return this.questionsService.getQuestions(language);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculateResults(
    @Body() body: ICalculateResultsBody,
    @Query('lang') queryLang: Language = Language.RU,
  ): Promise<any> {
    const language = body.lang || queryLang;
    return this.questionsService.calculateResults(body.answers, language);
  }

  @Get('directions')
  async getDirections(
    @Query('lang') language: Language = Language.RU,
  ): Promise<any[]> {
    return this.questionsService.getAvailableDirections(language);
  }

  @Get(':id')
  async getQuestionById(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') language: Language = Language.RU,
  ): Promise<any | null> {
    return this.questionsService.getQuestionById(id, language);
  }
}