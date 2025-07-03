import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserData } from './UserData';

@Entity('generated_prompts')
export class GeneratedPrompt {
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

  @Column({ type: 'jsonb', nullable: true })
  userData: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
