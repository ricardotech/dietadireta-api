import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { NivelAtividade, TipoPlanoTreino } from '../types/enums';

@Entity('user_activity')
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NivelAtividade })
  nivelAtividade: NivelAtividade;

  @Column({ type: 'enum', enum: TipoPlanoTreino })
  planoTreino: TipoPlanoTreino;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.activity)
  @JoinColumn()
  user: User;
}