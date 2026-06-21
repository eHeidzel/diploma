
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  role!: string;

  @Column({ length: 100 })
  company!: string;

  @Column({ length: 500 })
  avatar!: string;

  @Column({ type: 'float' })
  rating!: number;

  @Column({ type: 'text' })
  text!: string;

  @Column({ nullable: true })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  date!: Date;

  @Column({ default: true })
  isActive!: boolean;
}