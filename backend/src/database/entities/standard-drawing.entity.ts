import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DrawingCategory } from './drawing-category.entity';
import { DrawingParameter } from './drawing-parameter.entity';

export enum DrawingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
}

@Entity('standard_drawings')
export class StandardDrawing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => DrawingCategory, category => category.drawings)
  @JoinColumn({ name: 'categoryId' })
  category: DrawingCategory;

  @Column()
  categoryId: string;

  @ManyToOne(() => User, user => user.drawings)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @Column()
  uploaderId: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  validationScore: number;

  @Column({
    type: 'enum',
    enum: DrawingStatus,
    default: DrawingStatus.PENDING,
  })
  status: DrawingStatus;

  @Column({ type: 'jsonb', nullable: true })
  validationResults: any;

  @OneToMany(() => DrawingParameter, parameter => parameter.drawing, { cascade: true })
  parameters: DrawingParameter[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  matchCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
