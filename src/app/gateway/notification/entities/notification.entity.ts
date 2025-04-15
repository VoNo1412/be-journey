import { Task } from 'src/app/task/entities/task.entity';
import { TaskUser } from 'src/app/task/entities/task_user.entity';
import { User } from 'src/app/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    COMMENT = 'COMMENT',
    REMINDER = 'REMINDER',
}

@Entity()
export class Notification extends BaseEntity {
    @Column({ nullable: false })
    message: string;

    @Column({ nullable: false })
    taskUserId: number;

    @Column({ nullable: false })
    taskId: number;

    @Column()
    senderId: number;

    @Column()
    recipientId: number;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ default: false })
    isRead: boolean;

    // Quan hệ tới recipient
    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender: User;

    // Quan hệ tới recipient
    @ManyToOne(() => TaskUser, t => t.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskUserId' })
    taskUser: TaskUser;

    @ManyToOne(() => Task, t => t.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' })
    task: Task;
}
