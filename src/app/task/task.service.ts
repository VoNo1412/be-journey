import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubTask, SubTaskUser, Task, TaskUser } from './entities/task.entity';
import { UserService } from '../user/user.service';
import { CreateSubTaskDto } from './dto/create-subtask';
import convertToVietnamTime from 'src/common/time';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(SubTask) private readonly subTaskRepository: Repository<SubTask>,
    @InjectRepository(SubTaskUser) private readonly subTaskUserRepository: Repository<SubTaskUser>,

    private readonly userService: UserService
  ) { }

  async createSubTask(dto: CreateSubTaskDto) {
    try {
      const { taskId, title, description } = dto;
      const subTask = this.subTaskRepository.create({
        task: { taskId },
        title,
        description
      });
      return await this.subTaskRepository.save(subTask);
    } catch (error) {
      throw new Error(error);

    }
  }

  async createUserTask(createTaskDto: CreateTaskDto): Promise<any> {
    try {
      const { assignToId = [] } = createTaskDto;
      const task = this.taskRepository.create({
        user: { userId: createTaskDto.userId },
        title: createTaskDto.title,
        category: { categoryId: createTaskDto.categoryId }
      });
      const newTask = await this.taskRepository.save(task); // Lưu Task vào DB để có taskId

      // handle assigment task to users
      if (assignToId.length) {
        const taskUsers = assignToId.map((userId) => {
          return this.taskUserRepository.create({
            task: { taskId: newTask.taskId },
            assignToId: { userId },
          });
        });

        await this.taskUserRepository.save(taskUsers);
      }
      const taskUser = this.taskUserRepository.create({ task: { taskId: newTask.taskId } })
      const newTaskUser = await this.taskUserRepository.save(taskUser);
      return { statusCode: HttpStatus.OK, data: {...newTaskUser, taskId: newTask.taskId} };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTaskByUser(userId: number): Promise<any> {
    try {
      // Fetch tasks created by the user
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.category', 'category')
        .leftJoinAndSelect('task.taskUser', 'taskUser')
        .where('task.user = :userId', { userId })
        .andWhere('task.deleteAt IS NULL')
        .getMany();

      // Fetch subtasks related to user's tasks
      const subTasks = await this.subTaskRepository
        .createQueryBuilder('subTask')
        .innerJoin('subTask.task', 'task')
        .where('task.user = :userId', { userId })
        .andWhere('task.deleteAt IS NULL')
        .select(["subTask", "task.taskId"])
        .getMany();

      // Fetch students assigned to user's tasks
      const students = await this.taskUserRepository
        .createQueryBuilder('taskUser')
        .innerJoin('taskUser.assignToId', 'user')
        .where('taskUser.taskId IN (:...taskIds)', { taskIds: tasks.map(t => t.taskId) })
        .select(['taskUser.taskId', 'user.userId', 'user.name', 'user.avatar'])
        .getRawMany();

      // Normalize and structure task data
      const normalizedData = tasks.map(task => this.normalizeTask(task, students, subTasks));
      return { status: HttpStatus.OK, data: normalizedData };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks.");
    }
  }

  /**
   * Helper function to normalize task data
   */
  private normalizeTask(task, students, subTasks) {
    return {
      taskUserId: task.taskUser[0]?.taskUserId,
      taskId: task.taskId,
      title: task.title,
      isCompleted: task.taskUser[0]?.isCompleted || false,
      categoryId: task.category?.categoryId || null,
      color: task.category?.color || "black",
      nameCategory: task.category?.name || "other",
      createdAt: task.createdAt,
      time: convertToVietnamTime(task.createdAt),
      students: students.filter(student => student.taskId === task.taskId),
      subTasks: subTasks.filter(subTask => subTask.task.taskId === task.taskId),
    };
  }

  async findOne(taskId: number): Promise<any> {
    return this.taskRepository.findOne({ where: { taskId } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await this.taskRepository.delete(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
