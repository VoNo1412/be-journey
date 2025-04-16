import { Notification } from 'src/app/gateway/notification/entities/notification.entity';
import { TaskUser } from 'src/app/task/entities/task_user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, OneToMany, Index } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })  // ✅ UNIQUE constraint
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @OneToMany(() => TaskUser, (tu) => tu.user)
  task_user: TaskUser[]; 

  @OneToMany(() => Notification, (tu) => tu.sender)
  notifications: Notification[]; 
}
