import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StandardDrawing } from './standard-drawing.entity';

export enum ParameterDataType {
  NUMERIC = 'numeric',
  TEXT = 'text',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

@Entity('drawing_parameters')
export class DrawingParameter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StandardDrawing, drawing => drawing.parameters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drawingId' })
  drawing: StandardDrawing;

  @Column()
  drawingId: string;

  @Column()
  parameterName: string;

  @Column({ type: 'text' })
  parameterValue: string;

  @Column({ nullable: true })
  unit: string;

  @Column({
    type: 'enum',
    enum: ParameterDataType,
    default: ParameterDataType.NUMERIC,
  })
  dataType: ParameterDataType;

  @Column({ default: false })
  isCustom: boolean;
}
