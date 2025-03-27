import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTaskUser, Task, TaskUser } from './entities/task.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskUser, SubTaskUser]), UserModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService]

})
export class TaskModule { }
