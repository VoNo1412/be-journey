import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateAssigntedTaskDto, CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSubTaskDto } from './dto/create-subtask';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post('me')
  @ApiOperation({ summary: 'Created new task for user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created task success' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Post('assigned')
  creatTaskForUser(@Body() dto: CreateAssigntedTaskDto) {
    return this.taskService.createAssignedUser(dto);
  }

  @Get('sub/:userId')
  getAllSubTasks(@Param('userId') userId: number) {
    return this.taskService.getAllSubTask(userId);
  }

  @Post("sub")
  createSubTask(@Body() dto: CreateSubTaskDto) {
    try {
      return this.taskService.createSubTask(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete("sub/:id")
  deleteSubTask(@Param('id') id: number) {
    return this.taskService.deleteSubTask(+id);
  }

  @Put("sub/:id")
  updateSummarize(@Param('id') id: number, @Body('summarize') summarize: string) {
    return this.taskService.updateSummarize(+id, summarize);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Task from user' })
  findAll(@Param('userId') userId: number) {
    return this.taskService.getTaskByUser(+userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }


  @Delete('/task_user/:taskUserId')
  removeTaskUser(@Param('taskUserId') taskUserId: number) {
    return this.taskService.deleteTaskUser(+taskUserId);
  }
}
