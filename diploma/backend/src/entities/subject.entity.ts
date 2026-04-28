import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Enrollment } from '@entities/enrollment.entity';
import { Schedule } from '@entities/schedule.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ length: 50 })
  color!: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.subject)
  enrollments!: Enrollment[];

  @OneToMany(() => Schedule, (schedule) => schedule.subject)
  schedules!: Schedule[];
}
