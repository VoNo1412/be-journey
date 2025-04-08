import { TaskUser } from 'src/app/task/entities/task_user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, OneToMany, Index } from 'typeorm';

@Entity()
@Index('IDX_user_isOnline', ['isOnline'])  // Index on 'isOnline' for faster queries
@Index('IDX_user_lastSeen', ['lastSeen'])  // Index on 'lastSeen' for performance
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })  // ✅ UNIQUE constraint
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @OneToMany(() => TaskUser, (tu) => tu.user)
  task_user: TaskUser[]; 
}
