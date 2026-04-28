import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@entities/user.entity';
import { Subject } from '@entities/subject.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column()
  subjectId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column()
  teacherId!: number;

  @Column()
  dayOfWeek!: number;

  @Column({ length: 5 })
  startTime!: string;

  @Column({ length: 5 })
  endTime!: string;

  @Column({ length: 100, nullable: true })
  room!: string;
}
