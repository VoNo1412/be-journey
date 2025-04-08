import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/app/user/entities/user.entity";
import { Task } from "./task.entity";

@Entity()
export class TaskUser extends BaseEntity {
  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'enum', enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' })
  status: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "assignById" })
  assignBy: User; // người giao

  @Column({ nullable: true })
  assignById: number

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  taskId: number;

  @ManyToOne(() => User, u => u.task_user, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // người nhận
  user: User

  @ManyToOne(() => Task, (task) => task.task_user, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' }) // Explicitly define the foreign key column
  task: Task
}

