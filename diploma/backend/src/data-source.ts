import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Schedule } from './entities/schedule.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { Translation } from './entities/translation.entity';
import { Direction } from '@entities/direction.entity';
import { DirectionSkill } from '@entities/direction-skill.entity';
import { DirectionRecommendation } from '@entities/direction-recommendation.entity';
import { Activity } from '@entities/activity.entity';

config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'diploma_db',
  entities: [
    User,
    Activity,
    Schedule,
    Enrollment,
    Question,
    QuestionOption,
    Translation,
    Direction,
    DirectionSkill,
    DirectionRecommendation,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});
