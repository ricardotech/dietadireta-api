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
import { Objetivo, CaloriasDiarias, HorariosRefeicoesOption, Genero } from '../types/enums';

@Entity('body_measurements')
export class BodyMeasurements {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 5, scale: 2 })
  peso: number;

  @Column('int')
  altura: number;

  @Column('int')
  idade: number;

  @Column({ type: 'enum', enum: Objetivo })
  objetivo: Objetivo;

  @Column({ type: 'enum', enum: CaloriasDiarias, default: CaloriasDiarias.DESCONHECIDO })
  caloriasDiarias: CaloriasDiarias;

  @Column({ type: 'enum', enum: HorariosRefeicoesOption, default: HorariosRefeicoesOption.PERSONALIZADO })
  horariosParaRefeicoes: HorariosRefeicoesOption;

  @Column({ type: 'enum', enum: Genero })
  genero: Genero;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.bodyMeasurements)
  @JoinColumn()
  user: User;
}