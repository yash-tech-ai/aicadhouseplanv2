import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RuleType {
  SETBACK = 'setback',
  OPEN_SPACE = 'open_space',
  HEIGHT = 'height',
  FAR = 'far',
  COVERAGE = 'coverage',
  PARKING = 'parking',
  VENTILATION = 'ventilation',
  STAIRCASE = 'staircase',
  CUSTOM = 'custom',
}

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  region: string;

  @Column()
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({
    type: 'enum',
    enum: RuleType,
  })
  ruleType: RuleType;

  @Column({ type: 'jsonb' })
  ruleConfig: any;

  @Column({ default: 1 })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  applicableCategory: string;

  @Column({ type: 'text', nullable: true })
  reference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
