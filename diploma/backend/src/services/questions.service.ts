import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { Direction } from '../entities/direction.entity';
import { DirectionSkill } from '../entities/direction-skill.entity';
import { DirectionRecommendation } from '../entities/direction-recommendation.entity';
import { TranslationService } from './translation.service';
import { QuestionType, AnswerDirection, Language } from '@libs/shared';
import {
  IQuestionResponse,
  IUserAnswer,
  IDirectionResult,
  ITestResult,
} from '@libs/shared';

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

    const questionTranslations =
      await this.translationService.getEntityTranslations(
        'question',
        questionIds,
        language,
      );

    const optionTranslations =
      await this.translationService.getEntityTranslations(
        'option',
        optionIds,
        language,
      );

    const result: IQuestionResponse[] = [];
    for (const question of questions) {
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

      result.push({
        id: question.id,
        text: qTranslations.text || '',
        type: question.type,
        options: question.type !== QuestionType.TEXT ? options : undefined,
        explanation: qTranslations.explanation,
      });
    }

    return result;
  }

  async calculateResults(
    answers: IUserAnswer[],
    language: Language = Language.RU,
  ): Promise<ITestResult> {
    const scores: Record<string, number> = {};

    const directions = await this.directionRepo.find({
      where: { isActive: true },
    });

    if (!directions.length) {
      throw new NotFoundException('No directions found in database');
    }

    directions.forEach((dir) => {
      scores[dir.code] = 0;
    });

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

    const sortedDirections = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([dir]) => dir);

    const topDirectionCode = sortedDirections[0];
    const topDirectionEntity = directions.find(
      (d) => d.code === topDirectionCode,
    );

    const directionIds = directions.map((d) => d.id);
    const translations = await this.translationService.getEntityTranslations(
      'direction',
      directionIds,
      language,
    );

    const allSkills = await this.directionSkillRepo.find();
    const skillIds = allSkills.map((s) => s.id);
    const skillTranslations =
      await this.translationService.getEntityTranslations(
        'direction_skill',
        skillIds,
        language,
      );

    const results: IDirectionResult[] = [];
    for (const directionCode of sortedDirections) {
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
        direction: directionCode as AnswerDirection,
        name: dirTranslations.name || directionEntity.code,
        description: dirTranslations.description || '',
        icon: directionEntity.icon,
        color: directionEntity.color,
        skills: skillTexts,
        salary: dirTranslations.salary || '',
        totalScore: scores[directionCode],
      });
    }

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
    const translations = await this.translationService.getEntityTranslations(
      'direction',
      directionIds,
      language,
    );

    const allSkills = await this.directionSkillRepo.find();
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
        direction: direction.code as AnswerDirection,
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

  async getQuestionById(
    id: number,
    language: Language = Language.RU,
  ): Promise<IQuestionResponse | null> {
    const question = await this.questionRepo.findOne({
      where: { id, isActive: true },
      relations: ['options'],
    });

    if (!question) return null;

    const questionTranslations = await this.translationService.getTranslations(
      'question',
      question.id,
      language,
    );
    const optionIds = question.options?.map((o) => o.id) || [];
    const optionTranslations =
      await this.translationService.getEntityTranslations(
        'option',
        optionIds,
        language,
      );

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
