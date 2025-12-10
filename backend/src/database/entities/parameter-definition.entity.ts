import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ParameterDataType } from './drawing-parameter.entity';

// Re-export for convenience
export { ParameterDataType } from './drawing-parameter.entity';

@Entity('parameter_definitions')
export class ParameterDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ParameterDataType,
  })
  dataType: ParameterDataType;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', nullable: true })
  validationRules: any;

  @Column({ default: true })
  isSearchable: boolean;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: false })
  isAutoExtracted: boolean;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
