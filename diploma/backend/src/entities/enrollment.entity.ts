import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from '@entities/user.entity';
import { Subject } from '@entities/subject.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column()
  subjectId!: number;

  @CreateDateColumn()
  enrolledAt!: Date;
}
