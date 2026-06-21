
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Activity } from './activity.entity';
import { User } from './user.entity';
import { Enrollment } from './enrollment.entity';

export enum ScheduleStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity!: Activity;

  @Column()
  activityId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column()
  teacherId!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ length: 5 })
  startTime!: string;

  @Column({ length: 5 })
  endTime!: string;

  @Column({ length: 100, nullable: true })
  room!: string;

  @Column({ length: 500, nullable: true })
  meetLink!: string;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.PLANNED,
  })
  status!: ScheduleStatus;

  @Column({ type: 'int', default: 0 })
  maxStudents!: number;

  @Column({ type: 'int', default: 0 })
  enrolledCount!: number;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.schedule)
  enrollments!: Enrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
