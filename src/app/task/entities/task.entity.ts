import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { TaskUser } from "./task_user.entity";
import { SubTask } from "./subtask.entity";
import { Category } from "src/app/category/entities/category.entity";
import { Notification } from "src/app/gateway/notification/entities/notification.entity";
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

  @Column({ nullable: false })
  categoryId: number;

  @ManyToOne(() => Category, c => c.tasks, { nullable: true })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @OneToMany(() => Notification, (tu) => tu.task)
  notifications: Notification[];
}


