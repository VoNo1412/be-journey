import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssigntedTaskDto, CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserService } from '../user/user.service';
import { CreateSubTaskDto } from './dto/create-subtask';
import convertToVietnamTime from 'src/common/time';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task_user.entity';
import { SubTask } from './entities/subtask.entity';
import { NotificationService } from '../gateway/notification/notification.service';


@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(SubTask) private readonly subTaskRepository: Repository<SubTask>,
    private readonly userService: UserService,
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

  async createAssignedUser(dto: CreateAssigntedTaskDto) {
    try {
      const { title, categoryId, assignedUser, assignById } = dto;
      if (!assignedUser.length) {
        throw new HttpException("Not user to assign", HttpStatus.NOT_FOUND);
      }
      const task = this.taskRepository.create({ title, categoryId });
      const newTask = await this.taskRepository.save(task);

      return await this.taskUserRepository
        .createQueryBuilder()
        .insert()
        .into(TaskUser)
        .values(assignedUser.map(id => ({
          taskId: newTask.id,
          assignById,
          userId: id,
        })))
        .execute();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<{ statusCode: number; data: any }> {
    const { title, categoryId, userId } = createTaskDto;
  
    try {
      const task = await this.taskRepository.save({ title, categoryId });
  
      const taskUser = await this.taskUserRepository.save({
        taskId: task.id,
        userId,
      });
  
      return {
        statusCode: HttpStatus.OK,
        data: {
          taskId: task.id,
          userId: taskUser.userId,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async getTaskByUser(userId: number): Promise<any> {
    try {
      const taskUser = await this.taskUserRepository
        .createQueryBuilder('task_user') // Main entity: 'task'
        .innerJoinAndSelect('task_user.task', 'task') // Join task_user relations
        .leftJoinAndSelect('task.category', 'category') // Join category
        .leftJoinAndSelect('task.subtask', 'subtask') // Join subtask
        .leftJoinAndSelect('task_user.assignBy', 'assignBy') // Join subtask
        .leftJoinAndSelect('task_user.user', 'user')
        .where('task.deleteAt IS NULL')
        .andWhere('task_user.userId = :userId OR task_user.assignById = :userId', { userId })
        .getMany();

      const notifications = await this.notificationService.getNotificationsByUser(userId);
      const normalizedData = taskUser.map(tu => this.normalizeTask(tu, userId));
      return { status: HttpStatus.OK, data: normalizedData, notifications };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new HttpException("Failed to fetch tasks.", HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Helper function to normalize task data
   */
  private normalizeTask(taskUser: any, userId: number) {
    let checkTrueName = {};
    if (userId == taskUser.assignBy?.id) {
      checkTrueName["username"] = taskUser.user?.username;
      checkTrueName["avatar"] = taskUser.user?.avatar;
    } else {
      checkTrueName["username"] = taskUser.assignBy?.username;
      checkTrueName["avatar"] = taskUser.assignBy?.avatar;
    }


    return {
      taskUserId: taskUser.id,
      taskId: taskUser.task.id,
      title: taskUser.task.title,
      isCompleted: taskUser.isCompleted,
      categoryId: taskUser.task.category?.id,
      color: taskUser.task.category?.color,
      nameCategory: taskUser.task.category?.name,
      createdAt: taskUser.task?.createdAt,
      time: convertToVietnamTime(taskUser.createdAt),
      assigned: checkTrueName,
      subTasks: taskUser.task.subtask,
    };
  }

  async findOne(taskId: number): Promise<any> {
    try {
      return this.taskRepository.findOne({ where: { id: taskId } });
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<any> {
    return await this.taskUserRepository.update(id, updateTaskDto);
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await this.taskRepository.delete(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteTaskUser(id: number): Promise<any> {
    try {
      console.log('run inside here', id);
      return await this.taskUserRepository.delete(id);
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
