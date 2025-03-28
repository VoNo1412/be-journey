import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTask, SubTaskUser, Task, TaskUser } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskUser, SubTaskUser, SubTask]), UserModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService]

})
export class TaskModule { }
