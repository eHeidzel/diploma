import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { QuestionOption } from './question-option.entity';
import { QuestionType } from 'src/enums/QuestionType.enums';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.SINGLE })
  type!: QuestionType;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  order!: number;

  @OneToMany(() => QuestionOption, (option) => option.question, {
    cascade: true,
  })
  options!: QuestionOption[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
