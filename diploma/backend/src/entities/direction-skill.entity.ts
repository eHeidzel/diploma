import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Direction } from './direction.entity';

@Entity('direction_skills')
export class DirectionSkill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  skill!: string;

  @Column({ default: 0 })
  order!: number;

  @ManyToOne(() => Direction, (direction) => direction.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'directionId' })
  direction!: Direction;

  @Column()
  directionId!: number;
}
