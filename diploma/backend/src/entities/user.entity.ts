
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Schedule } from './schedule.entity';
import { UserRole } from '@libs/shared';
import { Notification } from './notification.entity';
import { UserSettings } from './user-settings.entity';
import { UserBalance } from './user-balance.entity';
import { BalanceTransaction } from './balance-transaction.entity';
import { ScheduleRequest } from './schedule-request.entity';
import { UserAccess } from './user-access.entity';
import { ActivityReview } from './activity-review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ length: 100, nullable: true })
  city!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string;

  @Column({ length: 500, nullable: true })
  avatar!: string;

  @Column({ type: 'date', nullable: true })
  birthDate!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ type: 'text', nullable: true })
  blockReason!: string;

  @Column({ type: 'datetime', nullable: true })
  blockUntil!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  
  @OneToMany(() => Enrollment, (enrollment: Enrollment) => enrollment.user)
  enrollments!: Enrollment[];

  @OneToMany(() => Schedule, (schedule: Schedule) => schedule.teacher)
  taughtSchedules!: Schedule[];

  @OneToMany(
    () => Notification,
    (notification: Notification) => notification.user,
  )
  notifications!: Notification[];

  @OneToOne(() => UserSettings, (settings: UserSettings) => settings.user)
  settings!: UserSettings;

  @OneToOne(() => UserBalance, (balance: UserBalance) => balance.user)
  balance!: UserBalance;

  @OneToMany(
    () => BalanceTransaction,
    (transaction: BalanceTransaction) => transaction.user,
  )
  balanceTransactions!: BalanceTransaction[];

  @OneToMany(
    () => ScheduleRequest,
    (request: ScheduleRequest) => request.requester,
  )
  scheduleRequests!: ScheduleRequest[];

  @OneToMany(() => UserAccess, (access: UserAccess) => access.user)
  accessRights!: UserAccess[];

  @OneToMany(() => ActivityReview, (review: ActivityReview) => review.user)
  activityReviews!: ActivityReview[];
}