import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { BreakfastItem } from './BreakfastItem';

@Entity('user_breakfast')
export class UserBreakfast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.breakfastSelections, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => BreakfastItem, { eager: true })
  item: BreakfastItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}