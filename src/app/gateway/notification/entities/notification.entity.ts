import { User } from 'src/app/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

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
    taskId: number;

    @Column({ nullable: false, default: true })
    subTaskId: number;
    
    @Column()
    senderId: number;
  
    @Column()
    recipientId: number;  

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ default: false })
    isRead: boolean;
}
