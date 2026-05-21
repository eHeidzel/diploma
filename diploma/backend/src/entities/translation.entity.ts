import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Language } from '@libs/shared';

@Entity('translations')
@Index(['entityType', 'entityId', 'field', 'language'], { unique: true })
export class Translation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  entityType!: string;

  @Column()
  entityId!: number;

  @Column({ length: 100 })
  field!: string;

  @Column({ type: 'enum', enum: Language })
  language!: Language;

  @Column({ type: 'text' })
  value!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
