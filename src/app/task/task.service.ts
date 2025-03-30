import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserService } from '../user/user.service';
import { CreateSubTaskDto } from './dto/create-subtask';
import convertToVietnamTime from 'src/common/time';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task_user.entity';
import { SubTask } from './entities/subtask.entity';
// import { SubTaskUser } from './entities/subtask_user.entity';
import { CategoryService } from '../category/category.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(SubTask) private readonly subTaskRepository: Repository<SubTask>,
    // @InjectRepository(SubTaskUser) private readonly subTaskUserRepository: Repository<SubTaskUser>,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService
  ) { }

  async createSubTask(dto: CreateSubTaskDto) {
    try {
      const { taskId, title, description, userId } = dto;
      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        throw new Error('Task not found');
      }
      // Check if the task is already completed
      const subTask = this.subTaskRepository.create({
        task,
        title,
        description,
        status: 'Pending',
      });

      const newSubTask = await this.subTaskRepository.save(subTask);
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // const userSubTask = this.subTaskUserRepository.create({
      //   subtask: newSubTask,
      //   user
      // });

      // Save the subtask to the database
      return newSubTask;
    } catch (error) {
      throw new Error(error);

    }
  }

  async createUserTask(createTaskDto: CreateTaskDto): Promise<any> {
    try {
      const { title, categoryId, userId, assignUserId } = createTaskDto;
      const category = await this.categoryService.findOne(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      const task = this.taskRepository.create({ title, category });
      const newTask = await this.taskRepository.save(task);
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const taskUser = this.taskUserRepository.create({
        task: newTask,
        user
      });

      if (assignUserId) {
        const assignUser = await this.userService.findUserById(assignUserId);
        if (!assignUser) {
          throw new Error('Assigned user not found');
        }

        const taskUser = this.taskUserRepository.create({
          task: newTask,
          user,
          assignBy: assignUser
        });

        await this.taskUserRepository.save(taskUser);
      }

      const newTaskUser = await this.taskUserRepository.save(taskUser);
      return { statusCode: HttpStatus.OK, data: { ...newTaskUser, taskId: newTask.id, } };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTaskByUser(userId: number): Promise<any> {
    try {
      const tasks = await this.taskRepository
        .createQueryBuilder('task') // Main entity: 'task'
        .innerJoinAndSelect('task.task_user', 'task_user') // Join task_user relation
        .leftJoinAndSelect('task.category', 'category') // Join category
        .leftJoinAndSelect('task.subtask', 'subtask') // Join subtask
        .leftJoinAndSelect('task_user.assignBy', 'assignBy') // Join subtask
        .leftJoinAndSelect('task_user.user', 'user')
        .where('task.deleteAt IS NULL')
        .andWhere('task_user.userId = :userId OR task_user.assignById = :userId', { userId })
        .getMany();

      const normalizedData = tasks.map(task => this.normalizeTask(task, userId));
      return { status: HttpStatus.OK, data: normalizedData };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks.");
    }
  }

  /**
   * Helper function to normalize task data
   */
  private normalizeTask(task: any, userId: number) {
    let checkTrueName = {};
    if (userId == task?.task_user[0]?.assignBy?.id) {
      checkTrueName["username"] = task?.task_user[0]?.user?.username;
      checkTrueName["avatar"] = task?.task_user[0]?.user?.avatar;
    } else {
      checkTrueName["username"] = task?.task_user[0]?.assignBy?.username;
      checkTrueName["avatar"] = task?.task_user[0]?.assignBy?.avatar;
    }


    return {
      taskUserId: task?.task_user[0]?.id,
      taskId: task.id,
      title: task.title,
      isCompleted: task?.task_user[0]?.isCompleted,
      categoryId: task.category?.id,
      color: task.category?.color,
      nameCategory: task.category?.name,
      createdAt: task?.createdAt,
      time: convertToVietnamTime(task.createdAt),
      assigned: checkTrueName,
      subTasks: task.subtask,
    };
  }

  async findOne(taskId: number): Promise<any> {
    return this.taskRepository.findOne({ where: { id: taskId } });
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

  async deleteSubTask(id: number): Promise<any> {
    try {
      await this.subTaskRepository.delete(id);
      return { statusCode: HttpStatus.OK }
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateSummarize(id: number, summarize: string): Promise<any> {
    try {
      const transform = summarize.trim();
      await this.subTaskRepository.update(id, { summarize: transform })
      return { statusCode: HttpStatus.OK }
    } catch (error) {
      throw new Error(error);
    }
  }
}
