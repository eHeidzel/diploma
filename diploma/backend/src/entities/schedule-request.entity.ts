
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Schedule } from './schedule.entity';

export enum RequestType {
  RESCHEDULE = 'reschedule',
  CANCELLATION = 'cancellation',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('schedule_requests')
export class ScheduleRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleId' })
  schedule!: Schedule;

  @Column()
  scheduleId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requesterId' })
  requester!: User;

  @Column()
  requesterId!: number;

  @Column({ type: 'enum', enum: RequestType })
  requestType!: RequestType;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'date', nullable: true })
  proposedDate!: string;

  @Column({ length: 5, nullable: true })
  proposedTime!: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status!: RequestStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
