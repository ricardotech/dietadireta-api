import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { 
  Objetivo, 
  HorariosRefeicoesOption, 
  Genero, 
  NivelAtividade, 
  TipoPlanoTreino 
} from '../types/enums';

@Entity('user_data')
export class UserData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User identification
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  // Body measurements
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  peso: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  altura: number;

  @Column({ type: 'int' })
  idade: number;

  @Column({ type: 'enum', enum: Objetivo })
  objetivo: Objetivo;

  @Column({ type: 'int', default: 2000, nullable: true })
  caloriasDiarias: number;

  @Column({ type: 'enum', enum: HorariosRefeicoesOption })
  horariosParaRefeicoes: HorariosRefeicoesOption;

  @Column({ type: 'enum', enum: Genero })
  genero: Genero;

  // Activity data
  @Column({ type: 'enum', enum: NivelAtividade })
  nivelAtividade: NivelAtividade;

  @Column({ type: 'enum', enum: TipoPlanoTreino })
  planoTreino: TipoPlanoTreino;

  // Meal preferences (storing as text arrays)
  @Column({ type: 'text', array: true, default: [] })
  cafeDaManha: string[];

  @Column({ type: 'text', array: true, default: [] })
  lancheDaManha: string[];

  @Column({ type: 'text', array: true, default: [] })
  almoco: string[];

  @Column({ type: 'text', array: true, default: [] })
  lancheDaTarde: string[];

  @Column({ type: 'text', array: true, default: [] })
  janta: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}