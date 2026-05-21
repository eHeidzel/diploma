import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Direction } from './direction.entity';

@Entity('direction_recommendations')
export class DirectionRecommendation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  recommendation!: string;

  @Column({ default: 0 })
  order!: number;

  @ManyToOne(() => Direction, (direction) => direction.recommendations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'directionId' })
  direction!: Direction;

  @Column()
  directionId!: number;
}
