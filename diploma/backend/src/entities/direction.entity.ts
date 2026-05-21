import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DirectionSkill } from './direction-skill.entity';
import { DirectionRecommendation } from './direction-recommendation.entity';

@Entity('directions')
export class Direction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  order!: number;

  @Column({ length: 10 })
  icon!: string;

  @Column({ length: 7 })
  color!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => DirectionSkill, (skill) => skill.direction, {
    cascade: true,
  })
  skills!: DirectionSkill[];

  @OneToMany(() => DirectionRecommendation, (rec) => rec.direction, {
    cascade: true,
  })
  recommendations!: DirectionRecommendation[];
}
