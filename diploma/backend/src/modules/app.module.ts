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
        entities: [User, Subject, Schedule, Enrollment],
        synchronize: true,
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([User, Subject, Schedule, Enrollment]),
  ],
  controllers: [
    UsersController,
    SubjectsController,
    ScheduleController,
    AuthController,
  ],
  providers: [UsersService, SubjectsService, ScheduleService, AuthService],
})
export class AppModule {}
