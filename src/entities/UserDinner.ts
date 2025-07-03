import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { DinnerItem } from './DinnerItem';

@Entity('user_dinner')
export class UserDinner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.dinnerSelections, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => DinnerItem, { eager: true })
  item: DinnerItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}