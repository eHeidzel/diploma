
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @Column({ default: 'ru' })
  language!: string;

  @Column({ default: true })
  emailNotifications!: boolean;

  @Column({ default: true })
  pushNotifications!: boolean;

  @Column({ default: true })
  bookingReminders!: boolean;

  @Column({ default: true })
  scheduleChanges!: boolean;

  @Column({ default: false })
  promotions!: boolean;

  @Column({ default: true })
  showProfile!: boolean;

  @Column({ default: true })
  showEmail!: boolean;

  @Column({ default: false })
  showPhone!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
