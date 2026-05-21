import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Question } from './question.entity';
import { Translation } from './translation.entity';
import { AnswerDirection } from '@libs/shared';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  order!: number;

  @Column({ type: 'json', nullable: true })
  directionScores!: Record<AnswerDirection, number>; // { frontend: 10, backend: 5, ... }

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question!: Question;

  @Column()
  questionId!: number;

  @OneToMany(() => Translation, (translation) => translation.entityId, {
    cascade: true,
  })
  translations!: Translation[];
}
