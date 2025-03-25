import { PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { Category } from 'src/app/category/entities/category.entity';
import { User } from 'src/app/user/entities/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('increment')
  taskId: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['Pending', 'In Progress', 'Completed'] })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}

@Entity()
export class TaskUser {
  @PrimaryGeneratedColumn('increment')
  taskUserId: number;

  @ManyToOne(() => Task, (task) => task.taskId, { nullable: true, onDelete: 'SET NULL' })
  task: Task;

  @ManyToOne(() => Category, (category) => category.categoryId, { nullable: true, onDelete: 'SET NULL' })
  category: Category;

  @ManyToOne(() => User, (user) => user.userId, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}
