import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';
import { Schedule } from './schedule.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity!: Activity;

  @Column()
  activityId!: number;

  @ManyToOne(() => Schedule, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scheduleId' })
  schedule!: Schedule;

  @Column({ nullable: true })
  scheduleId!: number;

  @Column({ default: false })
  isPaid!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidAmount!: number;

  @CreateDateColumn()
  enrolledAt!: Date;
}
