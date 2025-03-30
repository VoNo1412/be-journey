import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { TaskUser } from "./task_user.entity";
import { SubTask } from "./subtask.entity";
import { Category } from "src/app/category/entities/category.entity";
@Entity()
export class Task extends BaseEntity {
  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'enum', enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' })
  status: string;

  @OneToMany(() => TaskUser, (tu) => tu.task)
  task_user: TaskUser[];

  @OneToMany(() => SubTask, (t) => t.task, { nullable: true })
  subtask: SubTask[];

  @ManyToOne(() => Category, c => c.tasks, { nullable: true })
  category: Category;
}


