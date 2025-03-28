import { PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, JoinColumn } from 'typeorm';
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

  @ManyToOne(() => User, (user) => user.task, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' }) // Explicitly define the foreign key column
  user: User;

  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true, onDelete: 'SET NULL' })
  category: Category;

  @OneToMany(() => SubTask, (sub) => sub.task, { nullable: true, onDelete: 'SET NULL', cascade: true })
  subTasks: SubTask[];

  @OneToMany(() => TaskUser, (tu) => tu.task, { nullable: true, onDelete: 'SET NULL', cascade: true })
  taskUser: TaskUser[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}

@Entity()
export class TaskUser {
  @PrimaryGeneratedColumn('increment')
  taskUserId: number;

  @ManyToOne(() => Task, (task) => task.taskUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'taskId' }) // Explicitly define the foreign key column
  task: Task;

  @ManyToOne(() => User, (user) => user.userId, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' }) // Explicitly define the foreign key column
  assignToId: User;

  @OneToMany(() => SubTaskUser, (sub) => sub.id, { nullable: true, onDelete: 'SET NULL', cascade: true })
  subTaskUser: SubTaskUser[];

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}


@Entity()
export class SubTask {
  @PrimaryGeneratedColumn('increment')
  subTaskId: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Task, (t) => t.subTasks, { nullable: true, onDelete: 'SET NULL' })
  task: Task;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}


@Entity()
export class SubTaskUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => SubTask, (sub) => sub.subTaskId, { nullable: true, onDelete: 'SET NULL' })
  subTask: SubTask;

  @ManyToOne(() => User, (user) => user.userId, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => TaskUser, (tu) => tu.taskUserId, { nullable: true, onDelete: 'SET NULL' })
  taskUser: TaskUser;

  @Column({ type: 'enum', enum: ['Pending', 'In Progress', 'Completed'] })
  status: string;

  @Column({ type: 'text', nullable: true })
  summarize: string;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;
}
