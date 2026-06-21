
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';


import { User } from '@entities/user.entity';
import { Activity } from '@entities/activity.entity';
import { Schedule } from '@entities/schedule.entity';
import { Enrollment } from '@entities/enrollment.entity';
import { Translation } from '@entities/translation.entity';
import { Question } from '@entities/question.entity';
import { QuestionOption } from '@entities/question-option.entity';
import { Direction } from '@entities/direction.entity';
import { DirectionSkill } from '@entities/direction-skill.entity';
import { DirectionRecommendation } from '@entities/direction-recommendation.entity';
import { Review } from '@entities/review.entity';
import { Project } from '@entities/project.entity';
import { Notification } from '@entities/notification.entity';
import { UserSettings } from '@entities/user-settings.entity';
import { UserBalance } from '@entities/user-balance.entity';
import { BalanceTransaction } from '@entities/balance-transaction.entity';
import { ScheduleRequest } from '@entities/schedule-request.entity';
import { UserAccess } from '@entities/user-access.entity';
import { ActivityReview } from '@entities/activity-review.entity';
import { Material } from '@entities/material.entity';


import { UsersController } from '@controllers/users.controller';
import { ScheduleController } from '@controllers/schedule.controller';
import { AuthController } from '@controllers/auth.controller';
import { AccessController } from '@controllers/access.controller';
import { QuestionsController } from '@controllers/questions.controller';
import { ActivitiesController } from '@controllers/activities.controller';
import { ReviewsController } from '@controllers/reviews.controller';
import { ProjectsController } from '@controllers/projects.controller';
import { StatisticsController } from '@controllers/statistics.controller';
import { NotificationsController } from '@controllers/notifications.controller';
import { ProfileController } from '@controllers/profile.controller';
import { SettingsController } from '@controllers/settings.controller';
import { BalanceController } from '@controllers/balance.controller';
import { MaterialsController } from '@controllers/materials.controller';
import { WorkloadController } from '@controllers/workload.controller';
import { AdminController } from '@controllers/admin.controller';
import { ActivityReviewsController } from '@controllers/activity-reviews.controller';


import { UsersService } from '@services/users.service';
import { ScheduleService } from '@services/schedule.service';
import { AuthService } from '@services/auth.service';
import { AccessService } from '@services/access.service';
import { QuestionsService } from '@services/questions.service';
import { TranslationService } from '@services/translation.service';
import { ActivitiesService } from '@services/activities.service';
import { ReviewsService } from '@services/reviews.service';
import { ProjectsService } from '@services/projects.service';
import { StatisticsService } from '@services/statistics.service';
import { NotificationsService } from '@services/notifications.service';
import { ProfileService } from '@services/profile.service';
import { SettingsService } from '@services/settings.service';
import { BalanceService } from '@services/balance.service';
import { MaterialsService } from '@services/materials.service';
import { WorkloadService } from '@services/workload.service';
import { SeedService } from '@services/seed.service';
import { ActivityReviewsService } from '@services/activity-reviews.service';
import { EmailService } from '@services/email.service';
import { AdminService } from '@services/admin.service';
import { JwtStrategy } from '@strategies/jwt.strategy';


import { NotificationsGateway } from '../gateways/notifications.gateway';


import {
  I18nModule,
  HeaderResolver,
  QueryResolver,
  CookieResolver,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'secretKey',
        signOptions: { expiresIn: '7d' },
      }),
      global: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '3306') || '3306'),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'diploma_db'),
        entities: [
          User,
          Activity,
          Schedule,
          Enrollment,
          Translation,
          Question,
          QuestionOption,
          Direction,
          DirectionSkill,
          DirectionRecommendation,
          Review,
          Project,
          Notification,
          UserSettings,
          UserBalance,
          BalanceTransaction,
          ScheduleRequest,
          UserAccess,
          ActivityReview,
          Material,
        ],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Activity,
      Schedule,
      Enrollment,
      Translation,
      Question,
      QuestionOption,
      Direction,
      DirectionSkill,
      DirectionRecommendation,
      Review,
      Project,
      Notification,
      UserSettings,
      UserBalance,
      BalanceTransaction,
      ScheduleRequest,
      UserAccess,
      ActivityReview,
      Material,
    ]),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src', 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale'] },
        { use: HeaderResolver, options: ['accept-language'] },
        { use: CookieResolver, options: ['lang'] },
      ],
    }),
  ],
  controllers: [
    UsersController,
    ScheduleController,
    AuthController,
    AccessController,
    QuestionsController,
    ActivitiesController,
    ReviewsController,
    ProjectsController,
    StatisticsController,
    NotificationsController,
    ProfileController,
    SettingsController,
    BalanceController,
    MaterialsController,
    WorkloadController,
    AdminController,
    ActivityReviewsController,
  ],
  providers: [
    UsersService,
    ScheduleService,
    AuthService,
    AccessService,
    QuestionsService,
    TranslationService,
    ActivitiesService,
    ReviewsService,
    ProjectsService,
    StatisticsService,
    NotificationsService,
    ProfileService,
    SettingsService,
    BalanceService,
    MaterialsService,
    WorkloadService,
    AdminService,
    SeedService,
    ActivityReviewsService,
    EmailService,
    JwtStrategy,
    NotificationsGateway,
  ],
})
export class AppModule {}
