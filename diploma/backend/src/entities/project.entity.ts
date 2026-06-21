import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 100 })
  studentName!: string;

  @Column({ length: 100 })
  studentRole!: string;

  @Column({ type: 'json' })
  technologies!: string[];

  @Column({ type: 'text' })
  image!: string;

  @Column({ length: 500 })
  githubLink!: string;

  @Column({ length: 500 })
  demoLink!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
