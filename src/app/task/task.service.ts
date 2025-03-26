import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskUser } from './entities/task.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>,

    private readonly userService: UserService
  ) { }

  async createUserTask(createTaskDto: CreateTaskDto): Promise<any> {
    try {
      const task = this.taskRepository.create(createTaskDto);
      const newTask = await this.taskRepository.save(task); // Lưu Task vào DB để có taskId

      const taskUser = this.taskUserRepository.create({
        task: { taskId: newTask.taskId },
        user: { userId: createTaskDto.userId },
        category: { categoryId: createTaskDto.categoryId }
      });

      // 4. Lưu TaskUser vào database
      await this.taskUserRepository.save(taskUser);
      return { statusCode: HttpStatus.OK, data: newTask };
    } catch (error) {
      throw new Error(error);
    }
  }


  async getTaskUser(userId: number): Promise<any> {
    try {
      const taskUser = await this.taskUserRepository.find({ where: { user: { userId }, deleteAt: IsNull() }, relations: ["task", "user", "category"] })
      
      const normalizationData = !taskUser.length ? [] : taskUser.map(x => ({
        taskUserId: x.taskUserId,
        title: x.task.title,
        isCompleted: x.isCompleted,
        categoryId: x.category?.categoryId || null,
        color: x.category?.color || "black",
        nameCategory: x.category?.name || "other",
      }));

      return { status: HttpStatus.OK, data: normalizationData }
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(taskId: number): Promise<any> {
    return this.taskRepository.findOne({ where: { taskId } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async deleteTaskUser(id: number): Promise<void> {
    await this.taskUserRepository.delete(id);
  }
}
