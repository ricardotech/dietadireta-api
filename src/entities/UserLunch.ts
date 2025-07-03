import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { LunchItem } from './LunchItem';

@Entity('user_lunch')
export class UserLunch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.lunchSelections, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => LunchItem, { eager: true })
  item: LunchItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}