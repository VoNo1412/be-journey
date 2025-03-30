import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task_user.entity';
import { SubTask } from './entities/subtask.entity';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskUser, SubTask]),
    UserModule,
    CategoryModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService]

})
export class TaskModule { }
