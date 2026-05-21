import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { Subject } from '@entities/subject.entity';
import { Schedule } from '@entities/schedule.entity';
import { Enrollment } from '@entities/enrollment.entity';
import { UsersController } from '@controllers/users.controller';
import { SubjectsController } from '@controllers/subjects.controller';
import { ScheduleController } from '@controllers/schedule.controller';
import { AuthController } from '@controllers/auth.controller';
import { UsersService } from '@services/users.service';
import { SubjectsService } from '@services/subjects.service';
import { ScheduleService } from '@services/schedule.service';
import { AuthService } from '@services/auth.service';
import {
  I18nModule,
  HeaderResolver,
  QueryResolver,
  CookieResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { QuestionsController } from '@controllers/questions.controller';
import { QuestionsService } from '@services/questions.service';
import { TranslationService } from '@services/translation.service';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { Translation } from '../entities/translation.entity';
import { Direction } from '@entities/direction.entity';
import { DirectionSkill } from '@entities/direction-skill.entity';
import { DirectionRecommendation } from '@entities/direction-recommendation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
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
          Subject,
          Schedule,
          Enrollment,
          Question,
          QuestionOption,
          Translation,
          Direction,
          DirectionSkill,
          DirectionRecommendation,
        ],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: true,
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Subject,
      Schedule,
      Enrollment,
      Question,
      QuestionOption,
      Translation,
      Direction,
      DirectionSkill,
      DirectionRecommendation,
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
    SubjectsController,
    ScheduleController,
    AuthController,
    QuestionsController,
  ],
  providers: [
    UsersService,
    SubjectsService,
    ScheduleService,
    AuthService,
    QuestionsService,
    TranslationService,
  ],
})
export class AppModule {}
