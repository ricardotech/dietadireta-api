import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { MorningSnackItem } from './MorningSnackItem';

@Entity('user_morning_snack')
export class UserMorningSnack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.morningSnackSelections, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => MorningSnackItem, { eager: true })
  item: MorningSnackItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}