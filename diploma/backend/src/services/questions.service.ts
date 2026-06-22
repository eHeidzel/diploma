import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { Direction } from '../entities/direction.entity';
import { DirectionSkill } from '../entities/direction-skill.entity';
import { DirectionRecommendation } from '../entities/direction-recommendation.entity';
import { TranslationService } from './translation.service';
import { Language } from 'src/enums/Language.enums';
import { QuestionType } from 'src/enums/QuestionType.enums'; // Импортируем глобальный enum

// ============================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================

// Тип для ответа пользователя
export interface IAnswer {
  questionId: number;
  selectedOptionId: number;
}

// Тип для направления
export type AnswerDirection = string;

// Интерфейс для опции вопроса
export interface IQuestionOption {
  id: number;
  text: string;
  directionScores: Record<string, number>;
  order: number;
}

// Интерфейс для вопроса (ответ от API)
export interface IQuestionResponse {
  id: number;
  text: string;
  type: string;
  options?: IQuestionOption[];
  explanation?: string;
}

// Интерфейс для результата направления
export interface IDirectionResult {
  direction: AnswerDirection;
  name: string;
  description: string;
  icon: string;
  color: string;
  skills: string[];
  salary: string;
  totalScore: number;
}

// Интерфейс для результата теста
export interface ITestResult {
  results: IDirectionResult[];
  topDirection: IDirectionResult;
  recommendations: string[];
}

// ============================================
// СЕРВИС
// ============================================

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(QuestionOption)
    private optionRepo: Repository<QuestionOption>,
    @InjectRepository(Direction)
    private directionRepo: Repository<Direction>,
    @InjectRepository(DirectionSkill)
    private directionSkillRepo: Repository<DirectionSkill>,
    @InjectRepository(DirectionRecommendation)
    private directionRecommendationRepo: Repository<DirectionRecommendation>,
    private translationService: TranslationService,
  ) {}

  /**
   * Получить все активные вопросы с переводами
   */
  async getQuestions(
    language: Language = Language.RU,
  ): Promise<IQuestionResponse[]> {
    const questions = await this.questionRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
      relations: ['options'],
    });

    if (!questions.length) {
      return [];
    }

    const questionIds = questions.map((q) => q.id);
    const optionIds = questions.flatMap(
      (q) => q.options?.map((o) => o.id) || [],
    );

    const [questionTranslations, optionTranslations] = await Promise.all([
      this.translationService.getEntityTranslations(
        'question',
        questionIds,
        language,
      ),
      this.translationService.getEntityTranslations(
        'option',
        optionIds,
        language,
      ),
    ]);

    return questions.map((question) => {
      const qTranslations = questionTranslations.get(question.id) || {};

      const options = (question.options || [])
        .sort((a, b) => a.order - b.order)
        .map((option) => {
          const oTranslations = optionTranslations.get(option.id) || {};
          return {
            id: option.id,
            text: oTranslations.text || '',
            directionScores: option.directionScores,
            order: option.order,
          };
        });

      return {
        id: question.id,
        text: qTranslations.text || '',
        type: question.type,
        options: question.type !== QuestionType.TEXT ? options : undefined,
        explanation: qTranslations.explanation,
      };
    });
  }

  /**
   * Рассчитать результаты теста на основе ответов пользователя
   */
  async calculateResults(
    answers: IAnswer[],
    language: Language = Language.RU,
  ): Promise<ITestResult> {
    const directions = await this.directionRepo.find({
      where: { isActive: true },
    });

    if (!directions.length) {
      throw new NotFoundException('No directions found in database');
    }

    // Инициализация счетчиков для всех направлений
    const scores: Record<string, number> = {};
    directions.forEach((dir) => {
      scores[dir.code] = 0;
    });

    // Получение выбранных опций и подсчет баллов
    const selectedOptionIds = answers.map((a) => a.selectedOptionId);
    const options = await this.optionRepo.find({
      where: { id: In(selectedOptionIds) },
    });

    for (const option of options) {
      if (option.directionScores) {
        for (const [direction, score] of Object.entries(
          option.directionScores,
        )) {
          scores[direction] = (scores[direction] || 0) + (score as number);
        }
      }
    }

    // Сортировка направлений по убыванию баллов
    const sortedDirectionCodes = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([dir]) => dir);

    const topDirectionCode = sortedDirectionCodes[0];

    // Получение переводов для направлений
    const directionIds = directions.map((d) => d.id);
    const translations = await this.translationService.getEntityTranslations(
      'direction',
      directionIds,
      language,
    );

    // Получение переводов для навыков
    const allSkills = await this.directionSkillRepo.find();
    const skillIds = allSkills.map((s) => s.id);
    const skillTranslations =
      await this.translationService.getEntityTranslations(
        'direction_skill',
        skillIds,
        language,
      );

    // Формирование результатов для всех направлений
    const results: IDirectionResult[] = [];
    for (const directionCode of sortedDirectionCodes) {
      const directionEntity = directions.find((d) => d.code === directionCode);
      if (!directionEntity) continue;

      const dirTranslations = translations.get(directionEntity.id) || {};

      const skills = await this.directionSkillRepo.find({
        where: { directionId: directionEntity.id },
        order: { order: 'ASC' },
      });

      const skillTexts = skills.map((skill) => {
        const skillTrans = skillTranslations.get(skill.id);
        return skillTrans?.text || skill.skill;
      });

      results.push({
        direction: directionCode,
        name: dirTranslations.name || directionEntity.code,
        description: dirTranslations.description || '',
        icon: directionEntity.icon,
        color: directionEntity.color,
        skills: skillTexts,
        salary: dirTranslations.salary || '',
        totalScore: scores[directionCode],
      });
    }

    // Получение рекомендаций для топ-направления
    const topDirectionEntity = directions.find(
      (d) => d.code === topDirectionCode,
    );

    const recommendations = await this.directionRecommendationRepo.find({
      where: { directionId: topDirectionEntity?.id },
      order: { order: 'ASC' },
    });

    const recommendationIds = recommendations.map((r) => r.id);
    const recommendationTranslations =
      await this.translationService.getEntityTranslations(
        'direction_recommendation',
        recommendationIds,
        language,
      );

    const recommendationTexts = recommendations.map((rec) => {
      const recTrans = recommendationTranslations.get(rec.id);
      return recTrans?.text || rec.recommendation;
    });

    return {
      results,
      topDirection: results[0],
      recommendations: recommendationTexts,
    };
  }

  /**
   * Получить все доступные направления с переводами
   */
  async getAvailableDirections(
    language: Language = Language.RU,
  ): Promise<IDirectionResult[]> {
    const directions = await this.directionRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    if (!directions.length) {
      return [];
    }

    const directionIds = directions.map((d) => d.id);
    const [translations, allSkills] = await Promise.all([
      this.translationService.getEntityTranslations(
        'direction',
        directionIds,
        language,
      ),
      this.directionSkillRepo.find(),
    ]);

    const skillIds = allSkills.map((s) => s.id);
    const skillTranslations =
      await this.translationService.getEntityTranslations(
        'direction_skill',
        skillIds,
        language,
      );

    const results: IDirectionResult[] = [];
    for (const direction of directions) {
      const dirTranslations = translations.get(direction.id) || {};

      const skills = await this.directionSkillRepo.find({
        where: { directionId: direction.id },
        order: { order: 'ASC' },
      });

      const skillTexts = skills.map((skill) => {
        const skillTrans = skillTranslations.get(skill.id);
        return skillTrans?.text || skill.skill;
      });

      results.push({
        direction: direction.code,
        name: dirTranslations.name || direction.code,
        description: dirTranslations.description || '',
        icon: direction.icon,
        color: direction.color,
        skills: skillTexts,
        salary: dirTranslations.salary || '',
        totalScore: 0,
      });
    }

    return results;
  }

  /**
   * Получить вопрос по ID с переводами
   */
  async getQuestionById(
    id: number,
    language: Language = Language.RU,
  ): Promise<IQuestionResponse | null> {
    const question = await this.questionRepo.findOne({
      where: { id, isActive: true },
      relations: ['options'],
    });

    if (!question) return null;

    const [questionTranslations, optionTranslations] = await Promise.all([
      this.translationService.getTranslations('question', question.id, language),
      this.translationService.getEntityTranslations(
        'option',
        question.options?.map((o) => o.id) || [],
        language,
      ),
    ]);

    const options = (question.options || [])
      .sort((a, b) => a.order - b.order)
      .map((option) => ({
        id: option.id,
        text: optionTranslations.get(option.id)?.text || '',
        directionScores: option.directionScores,
        order: option.order,
      }));

    return {
      id: question.id,
      text: questionTranslations.text || '',
      type: question.type,
      options: question.type !== QuestionType.TEXT ? options : undefined,
      explanation: questionTranslations.explanation,
    };
  }
}