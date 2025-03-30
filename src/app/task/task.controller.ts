import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CreateSubTaskDto } from './dto/create-subtask';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createUserTask(createTaskDto);
  }

  @Post("sub")
  createSubTask(@Body() dto: CreateSubTaskDto) {
    return this.taskService.createSubTask(dto);
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

  @Delete(':taskId')
  remove(@Param('taskId') id: number) {
    return this.taskService.deleteTask(+id);
  }
}
