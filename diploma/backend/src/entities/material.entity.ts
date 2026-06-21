
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MaterialCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
  MOBILE = 'mobile',
  DEVOPS = 'devops',
  DATA_SCIENCE = 'data_science',
  QA = 'qa',
  PM = 'pm',
  UX_UI = 'ux_ui',
  SECURITY = 'security',
  GENERAL = 'general',
}

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 500 })
  link!: string;

  @Column({
    type: 'enum',
    enum: MaterialCategory,
    default: MaterialCategory.GENERAL,
  })
  category!: MaterialCategory;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
