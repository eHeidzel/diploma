import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Enrollment } from '@entities/enrollment.entity';
import { Schedule } from '@entities/schedule.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

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

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments!: Enrollment[];

  @OneToMany(() => Schedule, (schedule) => schedule.teacher)
  taughtSchedules!: Schedule[];
}
