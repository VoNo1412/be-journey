import { Task } from 'src/app/task/entities/task.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity()
export class Category extends BaseEntity {
  @Column({ type: 'enum', enum: ['Work', 'Personal', 'Study', 'Other'] })
  name: string;

  @Column({ type: 'text', nullable: true })
  color: string;

  @OneToMany(() => Task, task => task.category)
  tasks: Task[];
}
