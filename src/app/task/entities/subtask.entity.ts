
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { Task } from "./task.entity";
import { File } from "src/app/upload/entites/files.entity";

@Entity()
export class SubTask extends BaseEntity {
  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  summarize: string;

  @Column({ type: 'enum', enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' })
  status: string;

  @Column({ nullable: true })
  taskId: number;

  @ManyToOne(() => Task, (t) => t.subtask, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @OneToMany(() => File, f => f.subTask, { nullable: false, onDelete: 'CASCADE' })
  files: File[];
}