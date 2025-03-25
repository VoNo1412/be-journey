import { Task } from 'src/app/task/entities/task.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  categoryId: number;

  @Column({ type: 'enum', enum: ['Work', 'Personal', 'Study', 'Other'] })
  name: string;

  @Column({ type: 'text', nullable: true })
  color: string;

  @OneToMany(() => Task, task => task.taskId)
  tasks: Task[];
}
