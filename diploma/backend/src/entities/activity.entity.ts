import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ActivityType {
  WEBINAR = 'webinar',
  MASTERCLASS = 'masterclass',
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  TRIAL = 'trial',
}

export enum HourType {
  ACADEMIC = 'academic',
  ASTRONOMICAL = 'astronomical',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 100 })
  teacher!: string;

  @Column({ length: 255, nullable: true })
  teacherAvatar!: string;

  @Column({ length: 50 })
  duration!: string;

  @Column({ type: 'int', default: 60 })
  durationMinutes!: number;

  @Column({ type: 'enum', enum: HourType, nullable: true })
  hourType!: HourType;

  @Column({ type: 'float', nullable: true })
  price!: number;

  @Column({ type: 'json', nullable: true })
  categories!: string[];

  @Column({ type: 'json', nullable: true })
  availableTimes!: string[];

  @Column({ type: 'json', nullable: true })
  availableSlots!: string[];

  @Column({ type: 'json', nullable: true })
  availableDates!: { date: string; times: string[] }[];

  @Column({ type: 'json', nullable: true })
  availableAgeGroups!: string[];

  @Column({ type: 'varchar', nullable: true })
  groupPeriod!: string;

  @Column({ type: 'varchar', nullable: true })
  groupShift!: string;

  @Column({ type: 'json', nullable: true })
  learningPlan!: any[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  order!: number;

  @Column({ type: 'int', nullable: true })
  teacherId!: number;

  @Column({ type: 'json', nullable: true })
  targetAudience!: {
    ageRange: string;
    level: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}