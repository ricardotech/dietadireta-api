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

  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

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

  @Column({ 
    name: 'frequencia_treino',
    type: 'varchar', 
    length: 10, 
    default: '3-5',
    nullable: false 
  })
  frequenciaTreino: '1-3' | '3-5' | '5-7';

  // Health conditions
  @Column({ name: 'condicoes_saude', type: 'text', array: true, default: [] })
  condicoesSaude: string[];
  
  @Column({ name: 'alergias_alimentares', type: 'text', array: true, default: [] })
  alergiasAlimentares: string[];
  
  @Column({ name: 'restricoes_alimentares', type: 'text', array: true, default: [] })
  restricoesAlimentares: string[];
  
  @Column({ name: 'observacoes_medicas', type: 'text', nullable: true })
  observacoesMedicas?: string;

  // Diet mode
  @Column({ 
    name: 'diet_mode',
    type: 'varchar', 
    length: 20, 
    default: 'complete' 
  })
  dietMode: 'complete' | 'calories_only' | 'quick';
  
  @Column({ name: 'custom_calories', type: 'int', nullable: true })
  customCalories?: number;
  
  @Column({ name: 'skip_measurements', type: 'boolean', default: false })
  skipMeasurements: boolean;

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

  // Supplementation data
  @Column({ name: 'uses_supplements', type: 'boolean', default: false })
  usesSupplements: boolean;

  @Column({ name: 'supplements', type: 'text', array: true, default: [] })
  supplements: string[];

  @Column({ name: 'supplement_schedule', type: 'jsonb', nullable: true })
  supplementSchedule?: Record<string, string>;

  @Column({ name: 'supplement_brands', type: 'jsonb', nullable: true })
  supplementBrands?: Record<string, string>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}