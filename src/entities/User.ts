import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BodyMeasurements } from './BodyMeasurements';
import { UserActivity } from './UserActivity';
import { UserBreakfast } from './UserBreakfast';
import { UserMorningSnack } from './UserMorningSnack';
import { UserLunch } from './UserLunch';
import { UserAfternoonSnack } from './UserAfternoonSnack';
import { UserDinner } from './UserDinner';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => BodyMeasurements, (bm) => bm.user, { cascade: true })
  bodyMeasurements: BodyMeasurements;

  @OneToMany(() => UserBreakfast, (ub) => ub.user)
  breakfastSelections: UserBreakfast[];

  @OneToMany(() => UserMorningSnack, (ums) => ums.user)
  morningSnackSelections: UserMorningSnack[];

  @OneToMany(() => UserLunch, (ul) => ul.user)
  lunchSelections: UserLunch[];

  @OneToMany(() => UserAfternoonSnack, (uas) => uas.user)
  afternoonSnackSelections: UserAfternoonSnack[];

  @OneToMany(() => UserDinner, (ud) => ud.user)
  dinnerSelections: UserDinner[];

  @OneToOne(() => UserActivity, (ua) => ua.user, { cascade: true })
  activity: UserActivity;
}