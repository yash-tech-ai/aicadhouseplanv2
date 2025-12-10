import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StandardDrawing } from './standard-drawing.entity';

@Entity('drawing_categories')
export class DrawingCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => DrawingCategory, category => category.children, { nullable: true })
  parent: DrawingCategory;

  @OneToMany(() => DrawingCategory, category => category.parent)
  children: DrawingCategory[];

  @OneToMany(() => StandardDrawing, drawing => drawing.category)
  drawings: StandardDrawing[];

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
