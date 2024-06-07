import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { QueryListDto } from './dtos/params.dto';
import { Request } from 'express';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: Prisma.TaskCreateInput) {
    return this.taskService.create(data);
  }

  @Get()
  async findAll(
    @Query()
    { name = '', status = '', id = '', page = 1, limit = 10 }: QueryListDto,
  ) {
    return this.taskService.findAll({
      name,
      status,
      id,
      limit: Number(limit),
      page: Number(page),
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.TaskUpdateInput,
    @Req() request: Request,
  ) {
    request.user.id;
    return this.taskService.update(id, data, request.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
