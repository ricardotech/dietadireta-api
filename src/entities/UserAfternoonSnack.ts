import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { AfternoonSnackItem } from './AfternoonSnackItem';

@Entity('user_afternoon_snack')
export class UserAfternoonSnack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.afternoonSnackSelections, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => AfternoonSnackItem, { eager: true })
  item: AfternoonSnackItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}