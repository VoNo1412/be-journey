import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { Category } from 'src/app/category/entities/category.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('increment')
  taskId: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true, onDelete: 'SET NULL' })
  category: Category;

  @Column({ type: 'enum', enum: ['Pending', 'In Progress', 'Completed'] })
  status: string;

  @CreateDateColumn({ type: 'timestamp'})
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}
