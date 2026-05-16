import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Enrollment } from "./enrollment.entity";
import { Schedule } from "./schedule.entity";

@Entity("subjects")
export class Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ length: 50 })
  color!: string;

  @OneToMany(() => Enrollment, (enrollment: Enrollment) => enrollment.subject)
  enrollments!: Enrollment[];

  @OneToMany(() => Schedule, (schedule: Schedule) => schedule.subject)
  schedules!: Schedule[];
}
