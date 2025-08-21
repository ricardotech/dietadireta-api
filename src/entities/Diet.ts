import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserData } from './UserData';
import { OrderStatus } from '../types/enums';

@Entity('diets')
export class Diet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => UserData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserData;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text' })
  aiResponse: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  orderId?: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  membrosOrderId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  membrosOrderStatus?: string;

  @Column({ type: 'text', nullable: true })
  pixQrCodeUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  userData: any;

  @Column({ default: false })
  isRegenerated: boolean;

  @Column({ type: 'text', nullable: true })
  regenerationFeedback: string;

  @Column({ type: 'int', default: 0 })
  regenerationCount: number;

  @Column({ nullable: true })
  originalDietId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  trainingFrequency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  activityType: string;

  @Column({ type: 'jsonb', nullable: true })
  macroDistribution: any;

  @Column({ type: 'jsonb', nullable: true })
  scientificValidation: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
