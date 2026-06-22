
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Activity, ActivityType, HourType } from '../entities/activity.entity';
import { Schedule, ScheduleStatus } from '../entities/schedule.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Review } from '../entities/review.entity';
import { Project } from '../entities/project.entity';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { Direction } from '../entities/direction.entity';
import { DirectionSkill } from '../entities/direction-skill.entity';
import { DirectionRecommendation } from '../entities/direction-recommendation.entity';
import { Translation } from '../entities/translation.entity';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { UserBalance } from '../entities/user-balance.entity';
import {
  BalanceTransaction,
  TransactionType,
  TransactionStatus,
} from '../entities/balance-transaction.entity';
import { UserAccess } from '../entities/user-access.entity';
import { ActivityReview } from '../entities/activity-review.entity';
import { MaterialsService } from './materials.service';
import { UserRole } from 'src/enums/UserRole.enums';
import { Language } from 'src/enums/Language.enums';
import { QuestionType } from 'src/enums/QuestionType.enums';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
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
    @InjectRepository(Translation)
    private translationRepo: Repository<Translation>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(UserSettings)
    private settingsRepo: Repository<UserSettings>,
    @InjectRepository(UserBalance)
    private balanceRepo: Repository<UserBalance>,
    @InjectRepository(BalanceTransaction)
    private transactionRepo: Repository<BalanceTransaction>,
    @InjectRepository(UserAccess)
    private accessRepo: Repository<UserAccess>,
    @InjectRepository(ActivityReview)
    private activityReviewRepo: Repository<ActivityReview>,
    private materialsService: MaterialsService,
  ) {}

  async seedAll() {
    this.logger.log('Starting database seeding...');

    await this.seedUsers();
    await this.seedDirections();
    await this.seedQuestions();
    await this.seedActivities();
    await this.seedSchedules();
    await this.seedEnrollments();
    await this.seedReviews();
    await this.seedBalances();
    await this.seedActivityReviews();
    await this.materialsService.seedMaterials();

    this.logger.log('Database seeding completed!');
  }

  async seedUsers() {
    this.logger.log('Seeding users...');
    await this.userRepo.clear();

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Администратор',
        email: 'admin@codezone.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        phone: '+375291234567',
        city: 'Минск',
        bio: 'Главный администратор школы',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        name: 'Алексей Козлов',
        email: 'alexey@codezone.com',
        password: hashedPassword,
        role: UserRole.TEACHER,
        phone: '+375291234568',
        city: 'Минск',
        bio: 'Преподаватель фронтенда',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      {
        name: 'Мария Иванова',
        email: 'maria@codezone.com',
        password: hashedPassword,
        role: UserRole.TEACHER,
        phone: '+375291234569',
        city: 'Минск',
        bio: 'Преподаватель бэкенда',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      {
        name: 'Иван Петров',
        email: 'ivan@example.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        phone: '+375291234570',
        city: 'Минск',
        bio: 'Начинающий разработчик',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        birthDate: '2000-01-15',
      },
      {
        name: 'Екатерина Сидорова',
        email: 'ekaterina@example.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        phone: '+375291234571',
        city: 'Минск',
        bio: 'Хочу стать фронтенд-разработчиком',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        birthDate: '2001-05-20',
      },
      {
        name: 'Михаил Кузнецов',
        email: 'mikhail@example.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        phone: '+375291234572',
        city: 'Гомель',
        bio: 'Интересуюсь бэкендом',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        birthDate: '1999-10-10',
      },
    ];

    for (const user of users) {
      await this.userRepo.save(user);
    }
    this.logger.log(`Seeded ${users.length} users`);
  }

  async seedDirections() {
    this.logger.log('Seeding directions...');
    await this.directionRepo.clear();
    await this.directionSkillRepo.clear();
    await this.directionRecommendationRepo.clear();

    const directions = [
      {
        code: 'frontend',
        icon: '🎨',
        color: '#52c41a',
        isActive: true,
        order: 1,
      },
      {
        code: 'backend',
        icon: '⚙️',
        color: '#1890ff',
        isActive: true,
        order: 2,
      },
      {
        code: 'fullstack',
        icon: '🌐',
        color: '#722ed1',
        isActive: true,
        order: 3,
      },
      {
        code: 'mobile',
        icon: '📱',
        color: '#13c2c2',
        isActive: true,
        order: 4,
      },
      {
        code: 'devops',
        icon: '🚀',
        color: '#fa8c16',
        isActive: true,
        order: 5,
      },
      {
        code: 'data_science',
        icon: '📊',
        color: '#eb2f96',
        isActive: true,
        order: 6,
      },
      { code: 'qa', icon: '🐛', color: '#2f54eb', isActive: true, order: 7 },
      { code: 'pm', icon: '📋', color: '#faad14', isActive: true, order: 8 },
      { code: 'ux_ui', icon: '🎯', color: '#f5222d', isActive: true, order: 9 },
      {
        code: 'security',
        icon: '🔒',
        color: '#a0a0a0',
        isActive: true,
        order: 10,
      },
    ];

    const savedDirections: Direction[] = [];
    for (const dir of directions) {
      const saved = await this.directionRepo.save(dir);
      savedDirections.push(saved);
    }

    
    const skills = [
      { directionCode: 'frontend', skill: 'HTML/CSS', order: 1 },
      { directionCode: 'frontend', skill: 'JavaScript', order: 2 },
      { directionCode: 'frontend', skill: 'React/Vue', order: 3 },
      { directionCode: 'frontend', skill: 'TypeScript', order: 4 },
      { directionCode: 'backend', skill: 'Python/Django', order: 1 },
      { directionCode: 'backend', skill: 'Node.js', order: 2 },
      { directionCode: 'backend', skill: 'SQL/PostgreSQL', order: 3 },
      { directionCode: 'backend', skill: 'REST API', order: 4 },
      { directionCode: 'fullstack', skill: 'React + Node.js', order: 1 },
      { directionCode: 'fullstack', skill: 'MongoDB', order: 2 },
      { directionCode: 'fullstack', skill: 'Docker', order: 3 },
      { directionCode: 'fullstack', skill: 'Git/GitHub', order: 4 },
      { directionCode: 'mobile', skill: 'React Native', order: 1 },
      { directionCode: 'mobile', skill: 'Flutter', order: 2 },
      { directionCode: 'mobile', skill: 'iOS/Swift', order: 3 },
      { directionCode: 'mobile', skill: 'Android/Kotlin', order: 4 },
      { directionCode: 'devops', skill: 'Docker', order: 1 },
      { directionCode: 'devops', skill: 'Kubernetes', order: 2 },
      { directionCode: 'devops', skill: 'CI/CD', order: 3 },
      { directionCode: 'devops', skill: 'AWS/GCP', order: 4 },
    ];

    for (const skill of skills) {
      const direction = savedDirections.find(
        (d: Direction) => d.code === skill.directionCode,
      );
      if (direction) {
        await this.directionSkillRepo.save({
          directionId: direction.id,
          skill: skill.skill,
          order: skill.order,
        });
      }
    }

    
    const recommendations = [
      {
        directionCode: 'frontend',
        recommendation: 'Изучи HTML/CSS на Codecademy',
        order: 1,
      },
      {
        directionCode: 'frontend',
        recommendation: 'Пройди курс JavaScript на JavaScript.ru',
        order: 2,
      },
      {
        directionCode: 'frontend',
        recommendation: 'Создай свой первый проект на React',
        order: 3,
      },
      {
        directionCode: 'backend',
        recommendation: 'Начни с Python на Python.org',
        order: 1,
      },
      {
        directionCode: 'backend',
        recommendation: 'Изучи SQL на SQLZoo',
        order: 2,
      },
      {
        directionCode: 'backend',
        recommendation: 'Создай REST API на Django/Node.js',
        order: 3,
      },
      {
        directionCode: 'fullstack',
        recommendation: 'Пройди fullstack курс на The Odin Project',
        order: 1,
      },
      {
        directionCode: 'fullstack',
        recommendation: 'Создай полноценное MERN приложение',
        order: 2,
      },
      {
        directionCode: 'fullstack',
        recommendation: 'Изучи Git и GitHub',
        order: 3,
      },
    ];

    for (const rec of recommendations) {
      const direction = savedDirections.find(
        (d) => d.code === rec.directionCode,
      );
      if (direction) {
        await this.directionRecommendationRepo.save({
          directionId: direction.id,
          recommendation: rec.recommendation,
          order: rec.order,
        });
      }
    }

    
    const translations = [
      {
        entityCode: 'frontend',
        field: 'name',
        ru: 'Frontend-разработка',
        en: 'Frontend Development',
      },
      {
        entityCode: 'frontend',
        field: 'description',
        ru: 'Создание пользовательских интерфейсов',
        en: 'Creating user interfaces',
      },
      {
        entityCode: 'frontend',
        field: 'salary',
        ru: 'от 1500 BYN',
        en: 'from 1500 BYN',
      },
      {
        entityCode: 'backend',
        field: 'name',
        ru: 'Backend-разработка',
        en: 'Backend Development',
      },
      {
        entityCode: 'backend',
        field: 'description',
        ru: 'Серверная логика и базы данных',
        en: 'Server logic and databases',
      },
      {
        entityCode: 'backend',
        field: 'salary',
        ru: 'от 1800 BYN',
        en: 'from 1800 BYN',
      },
    ];

    for (const t of translations) {
      const direction = savedDirections.find(
        (d: Direction) => d.code === t.entityCode,
      );
      if (direction) {
        await this.translationRepo.save({
          entityType: 'direction',
          entityId: direction.id,
          field: t.field,
          language: Language.RU,
          value: t.ru,
        });
        await this.translationRepo.save({
          entityType: 'direction',
          entityId: direction.id,
          field: t.field,
          language: Language.EN,
          value: t.en,
        });
      }
    }

    this.logger.log(`Seeded ${directions.length} directions`);
  }

  async seedQuestions() {
    this.logger.log('Seeding questions...');
    await this.optionRepo.clear();
    await this.questionRepo.clear();

    const questionsData = [
      {
        text: 'Как вы предпочитаете решать сложные задачи?',
        type: QuestionType.SINGLE,
        order: 1,
        options: [
          {
            text: 'Анализирую данные и ищу оптимальное решение',
            scores: { backend: 10, data_science: 10, frontend: 5 },
          },
          {
            text: 'Пробую разные подходы, пока не найду рабочий',
            scores: { fullstack: 10, mobile: 8, devops: 8 },
          },
          {
            text: 'Создаю прототип и тестирую его',
            scores: { frontend: 10, ux_ui: 10, mobile: 8 },
          },
          {
            text: 'Ищу уже готовые решения и адаптирую',
            scores: { qa: 10, security: 8, pm: 8 },
          },
        ],
      },
      {
        text: 'Что вас больше всего привлекает в работе с технологиями?',
        type: QuestionType.SINGLE,
        order: 2,
        options: [
          {
            text: 'Создание красивых и удобных интерфейсов',
            scores: { frontend: 10, ux_ui: 10, mobile: 8 },
          },
          {
            text: 'Построение сложной серверной логики',
            scores: { backend: 10, devops: 8, fullstack: 8 },
          },
          {
            text: 'Работа с данными и аналитика',
            scores: { data_science: 10, backend: 8, qa: 5 },
          },
          {
            text: 'Обеспечение безопасности и стабильности',
            scores: { security: 10, devops: 10, qa: 8 },
          },
        ],
      },
    ];

    for (const q of questionsData) {
      const question = this.questionRepo.create({
        type: q.type,
        isActive: true,
        order: q.order,
      });
      await this.questionRepo.save(question);

      await this.translationRepo.save({
        entityType: 'question',
        entityId: question.id,
        field: 'text',
        language: Language.RU,
        value: q.text,
      });

      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        const option = this.optionRepo.create({
          questionId: question.id,
          order: i + 1,
          directionScores: opt.scores,
        });
        await this.optionRepo.save(option);

        await this.translationRepo.save({
          entityType: 'option',
          entityId: option.id,
          field: 'text',
          language: Language.RU,
          value: opt.text,
        });
      }
    }

    this.logger.log(`Seeded ${questionsData.length} questions`);
  }

  async seedActivities() {
    this.logger.log('Seeding activities...');
    await this.activityRepo.clear();

    const teachers = await this.userRepo.find({
      where: { role: UserRole.TEACHER },
    });
    const teacherAlexey = teachers.find((t) => t.name === 'Алексей Козлов');
    const teacherMaria = teachers.find((t) => t.name === 'Мария Иванова');

    const activities = [
      {
        type: ActivityType.WEBINAR,
        title: 'Введение в React Hooks',
        description:
          'Научитесь использовать хуки в React для управления состоянием',
        teacher: 'Алексей Козлов',
        teacherAvatar: teacherAlexey?.avatar || '',
        teacherId: teacherAlexey?.id,
        duration: '1.5 часа',
        hourType: HourType.ACADEMIC,
        price: 0,
        rating: 4.8,
        enrolledCount: 0,
        categories: ['frontend', 'fullstack'],
        availableDates: [
          { date: '2024-03-20', times: ['18:00', '20:00'] },
          { date: '2024-03-22', times: ['18:00', '20:00'] },
        ],
        availableAgeGroups: ['18-25', '25-35'],
        targetAudience: { ageRange: '18-35', level: 'beginner' },
        isActive: true,
        order: 1,
      },
      {
        type: ActivityType.MASTERCLASS,
        title: 'Асинхронное программирование в JavaScript',
        description: 'Промисы, async/await, обработка ошибок',
        teacher: 'Алексей Козлов',
        teacherAvatar: teacherAlexey?.avatar || '',
        teacherId: teacherAlexey?.id,
        duration: '2 часа',
        hourType: HourType.ASTRONOMICAL,
        price: 50,
        rating: 4.9,
        enrolledCount: 0,
        categories: ['frontend', 'fullstack'],
        availableDates: [{ date: '2024-03-25', times: ['14:00', '16:00'] }],
        availableAgeGroups: ['18-25', '25-35', '35+'],
        targetAudience: { ageRange: '18-35', level: 'intermediate' },
        isActive: true,
        order: 2,
      },
      {
        type: ActivityType.TRIAL,
        title: 'Пробное занятие по программированию',
        description: 'Знакомство с основами программирования',
        teacher: 'Алексей Козлов',
        teacherAvatar: teacherAlexey?.avatar || '',
        teacherId: teacherAlexey?.id,
        duration: '1 час',
        hourType: HourType.ACADEMIC,
        price: 0,
        rating: 4.9,
        enrolledCount: 0,
        categories: ['frontend', 'backend', 'fullstack'],
        availableDates: [
          { date: '2024-03-18', times: ['10:00', '12:00', '14:00', '16:00'] },
          { date: '2024-03-19', times: ['10:00', '12:00', '14:00', '16:00'] },
        ],
        availableAgeGroups: ['8-12', '13-17', '18-25', '25-35', '35+'],
        targetAudience: { ageRange: '8-35', level: 'beginner' },
        isActive: true,
        order: 3,
      },
    ];

    for (const activity of activities) {
      await this.activityRepo.save(activity);
    }

    this.logger.log(`Seeded ${activities.length} activities`);
  }

  async seedSchedules() {
    this.logger.log('Seeding schedules...');
    await this.scheduleRepo.clear();

    const activities = await this.activityRepo.find();
    const teachers = await this.userRepo.find({
      where: { role: UserRole.TEACHER },
    });

    const schedules: Schedule[] = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        for (const activity of activities) {
          if (activity.isActive && Math.random() > 0.7) {
            const startHour = 10 + Math.floor(Math.random() * 8);
            const teacher =
              teachers.find((t) => t.id === activity.teacherId) || teachers[0];

            const schedule = this.scheduleRepo.create({
              activityId: activity.id,
              teacherId: teacher.id,
              date: dateStr,
              startTime: `${startHour.toString().padStart(2, '0')}:00`,
              endTime: `${(startHour + 1).toString().padStart(2, '0')}:00`,
              room: `Аудитория ${Math.floor(Math.random() * 5) + 1}`,
              status: ScheduleStatus.PLANNED,
              maxStudents: activity.type === ActivityType.INDIVIDUAL ? 1 : 10,
              enrolledCount: 0,
            });
            schedules.push(schedule);
          }
        }
      }
    }

    for (const schedule of schedules) {
      await this.scheduleRepo.save(schedule);
    }

    this.logger.log(`Seeded ${schedules.length} schedules`);
  }

  async seedEnrollments() {
    this.logger.log('Seeding enrollments...');
    await this.enrollmentRepo.clear();

    const students = await this.userRepo.find({
      where: { role: UserRole.STUDENT },
    });
    const activities = await this.activityRepo.find();

    const enrollments: Enrollment[] = [];
    for (const student of students) {
      const numEnrollments = 2 + Math.floor(Math.random() * 2);
      const shuffledActivities = [...activities].sort(
        () => 0.5 - Math.random(),
      );

      for (
        let i = 0;
        i < numEnrollments && i < shuffledActivities.length;
        i++
      ) {
        const activity = shuffledActivities[i];
        const enrollment = this.enrollmentRepo.create({
          userId: student.id,
          activityId: activity.id,
          isPaid: activity.price === 0,
          paidAmount: activity.price || 0,
        });
        enrollments.push(enrollment);
      }
    }

    this.logger.log(`Seeded ${enrollments.length} enrollments`);
  }

  async seedReviews() {
    this.logger.log('Seeding reviews...');
    await this.reviewRepo.clear();

    const reviewsData = [
      {
        name: 'Анна Смирнова',
        role: 'Frontend-разработчик',
        company: 'Яндекс',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        rating: 5,
        text: 'Отличная школа! После курсов сразу нашла работу в крупной IT-компании.',
        date: new Date('2024-03-15'),
        isActive: true,
      },
      {
        name: 'Дмитрий Иванов',
        role: 'Fullstack-разработчик',
        company: 'Tinkoff',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        rating: 5,
        text: 'Лучшие курсы по программированию! Материал подаётся структурированно.',
        date: new Date('2024-02-10'),
        isActive: true,
      },
    ];

    for (const review of reviewsData) {
      await this.reviewRepo.save(review);
    }

    this.logger.log(`Seeded ${reviewsData.length} reviews`);
  }

  async seedBalances() {
    this.logger.log('Seeding balances...');
    await this.balanceRepo.clear();
    await this.transactionRepo.clear();

    const students = await this.userRepo.find({
      where: { role: UserRole.STUDENT },
    });

    for (const student of students) {
      const balance = Math.floor(Math.random() * 500) + 100;
      await this.balanceRepo.save({
        userId: student.id,
        balance,
      });

      await this.transactionRepo.save({
        userId: student.id,
        type: TransactionType.DEPOSIT,
        amount: balance,
        status: TransactionStatus.COMPLETED,
        description: 'Начальный баланс',
        paymentMethod: 'system',
        transactionId: `INIT_${student.id}`,
      });
    }

    this.logger.log(`Seeded ${students.length} balances`);
  }

  async seedActivityReviews() {
    this.logger.log('Seeding activity reviews...');
    await this.activityReviewRepo.clear();

    const students = await this.userRepo.find({
      where: { role: UserRole.STUDENT },
    });
    const activities = await this.activityRepo.find();

    const reviews: ActivityReview[] = [];
    for (const student of students) {
      const activity =
        activities[Math.floor(Math.random() * activities.length)];
      const review = this.activityReviewRepo.create({
        userId: student.id,
        activityId: activity.id,
        rating: 4 + Math.random(),
        text: 'Отличное занятие! Преподаватель всё понятно объясняет. Рекомендую!',
      });
      reviews.push(review);
    }

    for (const review of reviews) {
      await this.activityReviewRepo.save(review);
    }

    this.logger.log(`Seeded ${reviews.length} activity reviews`);
  }
}
