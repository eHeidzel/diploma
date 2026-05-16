import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Schedule } from './schedule.entity';
import { UserRole } from '@libs/shared';

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

  @OneToMany(() => Enrollment, (enrollment: Enrollment) => enrollment.user)
  enrollments!: Enrollment[];

  @OneToMany(() => Schedule, (schedule: Schedule) => schedule.teacher)
  taughtSchedules!: Schedule[];
}
