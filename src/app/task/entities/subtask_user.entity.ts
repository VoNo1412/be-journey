
// import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
// import { BaseEntity } from "src/common/entities/base.entity";
// import { SubTask } from "./subtask.entity";
// import { User } from "src/app/user/entities/user.entity";

// @Entity()
// export class SubTaskUser extends BaseEntity {
//   @Column({ type: 'text', nullable: true })
//   summarize: string;

//   @Column({ default: false })
//   isCompleted: boolean;

//   @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
//   assignBy: User;

//   @ManyToOne(() => SubTask, (st) => st.subtask_user, { nullable: true, onDelete: "SET NULL" })
//   @JoinColumn({ name: 'subtask_id' })
//   subtask: SubTask;

//   @ManyToOne(() => User, (u) => u.subtask_user, { nullable: true, onDelete: "SET NULL" })
//   @JoinColumn({ name: 'userId' }) // Explicitly define the foreign key column
//   user: User
// }