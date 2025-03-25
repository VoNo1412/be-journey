import { TaskUser } from 'src/app/task/entities/task.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  userId: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TaskUser, taskU => taskU.taskUserId, { nullable: true, cascade: true })
  taskUser: TaskUser[];
}
