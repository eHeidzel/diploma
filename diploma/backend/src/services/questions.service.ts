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

    // Получаем все направления из БД
    const directions = await this.directionRepo.find({
      where: { isActive: true },
    });

    if (!directions.length) {
      throw new NotFoundException('No directions found in database');
    }

    // Инициализируем счётчики
    directions.forEach((dir) => {
      scores[dir.code] = 0;
    });

    // Собираем все выбранные опции
    const selectedOptionIds = answers.map((a) => a.selectedOptionId);
    const options = await this.optionRepo.find({
      where: { id: In(selectedOptionIds) },
    });

    // Суммируем баллы по направлениям
    for (const option of options) {
      if (option.directionScores) {
        for (const [direction, score] of Object.entries(
          option.directionScores,
        )) {
          scores[direction] = (scores[direction] || 0) + (score as number);
        }
      }
    }

    // Сортируем направления по убыванию баллов
    const sortedDirections = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([dir]) => dir);

    const topDirectionCode = sortedDirections[0];
    const topDirectionEntity = directions.find(
      (d) => d.code === topDirectionCode,
    );

    // Получаем переводы для всех направлений одним запросом
    const directionIds = directions.map((d) => d.id);
    const translations = await this.translationService.getEntityTranslations(
      'direction',
      directionIds,
      language,
    );

    // Получаем все навыки
    const allSkills = await this.directionSkillRepo.find();
    const skillIds = allSkills.map((s) => s.id);
    const skillTranslations =
      await this.translationService.getEntityTranslations(
        'direction_skill',
        skillIds,
        language,
      );

    // Формируем результаты с данными из БД и переводов
    const results: IDirectionResult[] = [];
    for (const directionCode of sortedDirections) {
      const directionEntity = directions.find((d) => d.code === directionCode);
      if (!directionEntity) continue;

      const dirTranslations = translations.get(directionEntity.id) || {};

      // Получаем навыки для направления
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

    // Получаем рекомендации для топ направления
    const recommendations = await this.directionRecommendationRepo.find({
      where: { directionId: topDirectionEntity?.id },
      order: { order: 'ASC' },
    });

    // Получаем переводы для рекомендаций
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

  public async seedDirections() {
    // Создаём направления (только базовые данные без переводов)
    const directionsData = [
      {
        code: 'frontend',
        icon: '🎨',
        color: '#52c41a',
        order: 1,
        isActive: true,
      },
      {
        code: 'backend',
        icon: '⚙️',
        color: '#1890ff',
        order: 2,
        isActive: true,
      },
      {
        code: 'fullstack',
        icon: '🌐',
        color: '#722ed1',
        order: 3,
        isActive: true,
      },
      {
        code: 'mobile',
        icon: '📱',
        color: '#13c2c2',
        order: 4,
        isActive: true,
      },
      {
        code: 'devops',
        icon: '🚀',
        color: '#fa8c16',
        order: 5,
        isActive: true,
      },
      {
        code: 'data_science',
        icon: '📊',
        color: '#eb2f96',
        order: 6,
        isActive: true,
      },
      { code: 'qa', icon: '🐛', color: '#2f54eb', order: 7, isActive: true },
      { code: 'pm', icon: '📋', color: '#faad14', order: 8, isActive: true },
      { code: 'ux_ui', icon: '🎯', color: '#f5222d', order: 9, isActive: true },
      {
        code: 'security',
        icon: '🔒',
        color: '#a0a0a0',
        order: 10,
        isActive: true,
      },
    ];

    const savedDirections: any = [];
    for (const dirData of directionsData) {
      const existingDirection = await this.directionRepo.findOne({
        where: { code: dirData.code },
      });
      let direction;

      if (existingDirection) {
        direction = existingDirection;
        direction.icon = dirData.icon;
        direction.color = dirData.color;
        direction.order = dirData.order;
        direction.isActive = dirData.isActive;
        await this.directionRepo.save(direction);
      } else {
        direction = this.directionRepo.create(dirData);
        await this.directionRepo.save(direction);
      }
      savedDirections.push(direction);

      // Добавляем русские переводы
      const ruTranslations = {
        frontend: {
          name: 'Frontend-разработчик',
          description:
            'Создаёте интерфейсы, делаете сайты красивыми и удобными',
          salary: 'от 80 000 ₽',
        },
        backend: {
          name: 'Backend-разработчик',
          description:
            'Разрабатываете серверную логику, работаете с базами данных',
          salary: 'от 100 000 ₽',
        },
        fullstack: {
          name: 'Fullstack-разработчик',
          description: 'Сочетаете frontend и backend разработку',
          salary: 'от 120 000 ₽',
        },
        mobile: {
          name: 'Мобильный разработчик',
          description: 'Создаёте приложения для iOS и Android',
          salary: 'от 90 000 ₽',
        },
        devops: {
          name: 'DevOps инженер',
          description:
            'Автоматизируете развертывание и управляете инфраструктурой',
          salary: 'от 150 000 ₽',
        },
        data_science: {
          name: 'Data Scientist',
          description:
            'Анализируете данные, создаёте модели машинного обучения',
          salary: 'от 130 000 ₽',
        },
        qa: {
          name: 'QA инженер',
          description: 'Тестируете приложения, ищете баги и улучшаете качество',
          salary: 'от 70 000 ₽',
        },
        pm: {
          name: 'Project Manager',
          description: 'Управляете командами, планируете проекты',
          salary: 'от 120 000 ₽',
        },
        ux_ui: {
          name: 'UX/UI дизайнер',
          description:
            'Проектируете интерфейсы, исследуете пользовательский опыт',
          salary: 'от 80 000 ₽',
        },
        security: {
          name: 'Security специалист',
          description: 'Защищаете системы от атак и уязвимостей',
          salary: 'от 140 000 ₽',
        },
      };

      const ruData = ruTranslations[direction.code];
      if (ruData) {
        await this.translationService.setTranslation(
          'direction',
          direction.id,
          'name',
          Language.RU,
          ruData.name,
        );
        await this.translationService.setTranslation(
          'direction',
          direction.id,
          'description',
          Language.RU,
          ruData.description,
        );
        await this.translationService.setTranslation(
          'direction',
          direction.id,
          'salary',
          Language.RU,
          ruData.salary,
        );
      }

      // Добавляем английские переводы
      const enTranslations = {
        frontend: {
          name: 'Frontend Developer',
          description:
            'Create interfaces, make websites beautiful and user-friendly',
          salary: 'from $800',
        },
        backend: {
          name: 'Backend Developer',
          description: 'Develop server logic, work with databases',
          salary: 'from $1000',
        },
        fullstack: {
          name: 'Fullstack Developer',
          description: 'Combine frontend and backend development',
          salary: 'from $1200',
        },
        mobile: {
          name: 'Mobile Developer',
          description: 'Create applications for iOS and Android',
          salary: 'from $900',
        },
        devops: {
          name: 'DevOps Engineer',
          description: 'Automate deployment and manage infrastructure',
          salary: 'from $1500',
        },
        data_science: {
          name: 'Data Scientist',
          description: 'Analyze data, create machine learning models',
          salary: 'from $1300',
        },
        qa: {
          name: 'QA Engineer',
          description: 'Test applications, find bugs and improve quality',
          salary: 'from $700',
        },
        pm: {
          name: 'Project Manager',
          description: 'Manage teams, plan projects',
          salary: 'from $1200',
        },
        ux_ui: {
          name: 'UX/UI Designer',
          description: 'Design interfaces, research user experience',
          salary: 'from $800',
        },
        security: {
          name: 'Security Specialist',
          description: 'Protect systems from attacks and vulnerabilities',
          salary: 'from $1400',
        },
      };

      const enData = enTranslations[direction.code];
      if (enData) {
        await this.translationService.setTranslation(
          'direction',
          direction.id,
          'name',
          Language.EN,
          enData.name,
        );
        await this.translationService.setTranslation(
          'direction',
          direction.id,
          'description',
          Language.EN,
          enData.description,
        );
        await this.translationService.setTranslation(
          'direction',
          direction.id,
          'salary',
          Language.EN,
          enData.salary,
        );
      }

      // Добавляем навыки
      const skillsData = this.getDirectionSkillsData(direction.code);
      for (let i = 0; i < skillsData.length; i++) {
        let skill = await this.directionSkillRepo.findOne({
          where: { directionId: direction.id, order: i },
        });

        if (!skill) {
          skill = this.directionSkillRepo.create({
            directionId: direction.id,
            skill: skillsData[i],
            order: i,
          });
          await this.directionSkillRepo.save(skill);
        } else {
          skill.skill = skillsData[i];
          await this.directionSkillRepo.save(skill);
        }

        // Добавляем английский перевод для навыка
        const enSkill = this.getDirectionSkillsDataEn(direction.code)?.[i];
        if (enSkill) {
          await this.translationService.setTranslation(
            'direction_skill',
            skill.id,
            'text',
            Language.EN,
            enSkill,
          );
        }
        await this.translationService.setTranslation(
          'direction_skill',
          skill.id,
          'text',
          Language.RU,
          skillsData[i],
        );
      }

      // Добавляем рекомендации
      const recommendationsData = this.getRecommendationsData(direction.code);
      for (let i = 0; i < recommendationsData.length; i++) {
        let recommendation = await this.directionRecommendationRepo.findOne({
          where: { directionId: direction.id, order: i },
        });

        if (!recommendation) {
          recommendation = this.directionRecommendationRepo.create({
            directionId: direction.id,
            recommendation: recommendationsData[i],
            order: i,
          });
          await this.directionRecommendationRepo.save(recommendation);
        } else {
          recommendation.recommendation = recommendationsData[i];
          await this.directionRecommendationRepo.save(recommendation);
        }

        // Добавляем английский перевод для рекомендации
        const enRecommendation = this.getRecommendationsDataEn(
          direction.code,
        )?.[i];
        if (enRecommendation) {
          await this.translationService.setTranslation(
            'direction_recommendation',
            recommendation.id,
            'text',
            Language.EN,
            enRecommendation,
          );
        }
        await this.translationService.setTranslation(
          'direction_recommendation',
          recommendation.id,
          'text',
          Language.RU,
          recommendationsData[i],
        );
      }
    }

    return { result: 'Success' };
  }

  private getDirectionSkillsData(code: string): string[] {
    const skillsMap: Record<string, string[]> = {
      frontend: [
        'HTML/CSS',
        'JavaScript/TypeScript',
        'React/Vue/Angular',
        'Адаптивный дизайн',
      ],
      backend: ['Node.js/Python/Java', 'SQL/PostgreSQL', 'REST API', 'Docker'],
      fullstack: [
        'HTML/CSS/JS',
        'React/Vue/Angular',
        'Node.js/Python',
        'Базы данных',
      ],
      mobile: [
        'Swift/Kotlin',
        'React Native/Flutter',
        'iOS/Android SDK',
        'UI/UX',
      ],
      devops: ['Linux', 'Docker/Kubernetes', 'CI/CD', 'AWS/Cloud'],
      data_science: ['Python', 'Pandas/NumPy', 'TensorFlow/PyTorch', 'SQL'],
      qa: [
        'Ручное тестирование',
        'Автоматизация',
        'Selenium/Cypress',
        'Тест-дизайн',
      ],
      pm: [
        'Управление проектами',
        'Agile/Scrum',
        'Jira/Trello',
        'Коммуникация',
      ],
      ux_ui: [
        'Figma/Sketch',
        'Прототипирование',
        'User Research',
        'Визуальный дизайн',
      ],
      security: [
        'Сетевая безопасность',
        'Penetration testing',
        'Шифрование',
        'OWASP',
      ],
    };
    return skillsMap[code] || [];
  }

  private getDirectionSkillsDataEn(code: string): string[] {
    const skillsMap: Record<string, string[]> = {
      frontend: [
        'HTML/CSS',
        'JavaScript/TypeScript',
        'React/Vue/Angular',
        'Responsive Design',
      ],
      backend: ['Node.js/Python/Java', 'SQL/PostgreSQL', 'REST API', 'Docker'],
      fullstack: [
        'HTML/CSS/JS',
        'React/Vue/Angular',
        'Node.js/Python',
        'Databases',
      ],
      mobile: [
        'Swift/Kotlin',
        'React Native/Flutter',
        'iOS/Android SDK',
        'UI/UX',
      ],
      devops: ['Linux', 'Docker/Kubernetes', 'CI/CD', 'AWS/Cloud'],
      data_science: ['Python', 'Pandas/NumPy', 'TensorFlow/PyTorch', 'SQL'],
      qa: ['Manual testing', 'Automation', 'Selenium/Cypress', 'Test design'],
      pm: ['Project management', 'Agile/Scrum', 'Jira/Trello', 'Communication'],
      ux_ui: ['Figma/Sketch', 'Prototyping', 'User Research', 'Visual design'],
      security: [
        'Network security',
        'Penetration testing',
        'Cryptography',
        'OWASP',
      ],
    };
    return skillsMap[code] || [];
  }

  private getRecommendationsData(code: string): string[] {
    const recommendationsMap: Record<string, string[]> = {
      frontend: [
        'Изучите HTML, CSS и JavaScript',
        'Попробуйте создать свой первый сайт',
        'Изучите React или Vue.js',
      ],
      backend: [
        'Изучите Python или JavaScript',
        'Познакомьтесь с базами данных SQL',
        'Начните создавать простые API',
      ],
      fullstack: [
        'Освойте frontend и backend основы',
        'Изучите работу с базами данных',
        'Попробуйте создать полное приложение',
      ],
      mobile: [
        'Изучите Swift для iOS или Kotlin для Android',
        'Попробуйте React Native для кроссплатформы',
        'Создайте своё первое приложение',
      ],
      devops: [
        'Изучите Linux и командную строку',
        'Познакомьтесь с Docker',
        'Изучите CI/CD процессы',
      ],
      data_science: [
        'Изучите Python и библиотеки для данных',
        'Познакомьтесь с Pandas и NumPy',
        'Изучите основы статистики',
      ],
      qa: [
        'Изучите основы тестирования',
        'Попробуйте писать тест-кейсы',
        'Изучите автоматизацию на Selenium',
      ],
      pm: [
        'Изучите Agile и Scrum',
        'Познакомьтесь с Jira/Trello',
        'Развивайте коммуникативные навыки',
      ],
      ux_ui: [
        'Изучите Figma',
        'Познакомьтесь с принципами юзабилити',
        'Создайте портфолио с дизайн-проектами',
      ],
      security: [
        'Изучите основы сетевой безопасности',
        'Познакомьтесь с OWASP Top 10',
        'Изучите этичный хакинг',
      ],
    };
    return recommendationsMap[code] || [];
  }

  private getRecommendationsDataEn(code: string): string[] {
    const recommendationsMap: Record<string, string[]> = {
      frontend: [
        'Learn HTML, CSS and JavaScript',
        'Try to create your first website',
        'Learn React or Vue.js',
      ],
      backend: [
        'Learn Python or JavaScript',
        'Get familiar with SQL databases',
        'Start creating simple APIs',
      ],
      fullstack: [
        'Master frontend and backend basics',
        'Learn working with databases',
        'Try to build a full application',
      ],
      mobile: [
        'Learn Swift for iOS or Kotlin for Android',
        'Try React Native for cross-platform',
        'Create your first app',
      ],
      devops: [
        'Learn Linux and command line',
        'Get familiar with Docker',
        'Learn CI/CD processes',
      ],
      data_science: [
        'Learn Python and data libraries',
        'Get familiar with Pandas and NumPy',
        'Learn statistics basics',
      ],
      qa: [
        'Learn testing basics',
        'Try writing test cases',
        'Learn automation with Selenium',
      ],
      pm: [
        'Learn Agile and Scrum',
        'Get familiar with Jira/Trello',
        'Develop communication skills',
      ],
      ux_ui: [
        'Learn Figma',
        'Get familiar with usability principles',
        'Build a portfolio with design projects',
      ],
      security: [
        'Learn network security basics',
        'Get familiar with OWASP Top 10',
        'Learn ethical hacking',
      ],
    };
    return recommendationsMap[code] || [];
  }
}
