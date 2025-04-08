import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserService } from '../user/user.service';
import { CreateSubTaskDto } from './dto/create-subtask';
import convertToVietnamTime from 'src/common/time';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task_user.entity';
import { SubTask } from './entities/subtask.entity';
import { CategoryService } from '../category/category.service';
import { NotificationService } from '../gateway/notification/notification.service';
import { NotificationType } from '../gateway/notification/entities/notification.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(SubTask) private readonly subTaskRepository: Repository<SubTask>,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly notificationService: NotificationService,
  ) { }

  async getAllSubTask(userId: number) {
    const subtasks = await this.taskUserRepository.createQueryBuilder('task_user')
      .innerJoin('task_user.task', 'task') // Join with the task
      .leftJoinAndSelect('task.subtask', 'sub_task') // Join with subtasks
      .where("task_user.userId = :userId", { userId })
      .select([
        'sub_task.id',
        'sub_task.title',
        'sub_task.description',
        'sub_task.status',
        'task_user.id', // Include task_user ID or any other necessary field
        'task.id', // Include task ID or any other necessary field
        'sub_task.createdAt'
      ])
      .getMany();

    const allSubTasks = subtasks.flatMap(taskUser => taskUser?.task?.subtask);

    // Use a Map to remove duplicates based on subtask ID
    const uniqueSubTasks = Array.from(
      new Map(allSubTasks.map(subtask => [subtask.id, subtask])).values()
    );

    uniqueSubTasks.forEach((x: any) => {
      x["time"] = convertToVietnamTime(x.createdAt);
      delete x.createdAt;
    });

    return { status: HttpStatus.OK, data: uniqueSubTasks }; // Return only the array of subtasks
  }

  async createSubTask(dto: CreateSubTaskDto) {
    try {
      const { taskId, title, description, userId } = dto;
      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
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
      const task = this.taskRepository.create({ title, categoryId });
      const newTask = await this.taskRepository.save(task);

      const taskUser = this.taskUserRepository.create({
        taskId: newTask.id,
        userId,
        assignById: assignUserId
      });

      if (userId && assignUserId) {
        await this.notificationService.create({
          taskId: newTask.id,
          senderId: taskUser.assignById,
          recipientId: userId,
          type: NotificationType.TASK_ASSIGNED,
          isRead: false,
          title: newTask.title,
          message: "You have a new task todo"
        })
      }

      const newTaskUser = await this.taskUserRepository.save(taskUser);
      return { statusCode: HttpStatus.OK, data: { ...newTaskUser, taskId: newTask.id, } };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
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
    try {
      return this.taskRepository.findOne({ where: { id: taskId } });
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
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
