import { Prisma, TaskStatus } from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { QueryListDto } from './dtos/params.dto';
import { AppException } from '../../AppException';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { RabbitMQService } from '../../lib/rabbit/rabbit-mq.service';

@Injectable()
export class TaskService {
  constructor(
    private prismaService: PrismaService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(data: Prisma.TaskCreateInput) {
    const statusLowerCase = data.status.toLowerCase();

    let taskStatus: TaskStatus;
    if (statusLowerCase === 'pending') {
      taskStatus = TaskStatus.PENDING;
    } else if (statusLowerCase === 'in_progress') {
      taskStatus = TaskStatus.IN_PROGRESS;
    } else if (statusLowerCase === 'completed') {
      taskStatus = TaskStatus.COMPLETED;
    } else {
      throw new AppException('Invalid status.', HttpStatus.BAD_REQUEST);
    }

    data.status = taskStatus;

    await this.prismaService.task.create({ data });
  }

  async findAll({ name, status, id, limit, page }: QueryListDto) {
    const where: any = {
      name: {
        contains: name,
      },
    };

    if (id) {
      where.id = id;
    }

    if (status) {
      where.status = status;
    }

    const count = await this.prismaService.task.count({
      where: where,
    });

    const max_page = Math.ceil(count / limit);

    const tasks = await this.prismaService.task.findMany({
      where,
      orderBy: {
        status: 'asc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: tasks,
      limit: limit,
      total: count,
      totalPage: max_page,
      page,
    };
  }

  async findOne(id: string) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppException('Task not found.', HttpStatus.NOT_FOUND);
    }

    return { task };
  }

  async update(id: string, data: Prisma.TaskUpdateInput, userId: string) {
    await this.findOne(id);
    if (data.status && typeof data.status === 'string') {
      const statusLowerCase = data.status.toLowerCase();

      let taskStatus: TaskStatus;
      if (statusLowerCase === 'pending') {
        taskStatus = TaskStatus.PENDING;
      } else if (statusLowerCase === 'in_progress') {
        taskStatus = TaskStatus.IN_PROGRESS;
      } else if (statusLowerCase === 'completed') {
        taskStatus = TaskStatus.COMPLETED;
      } else {
        throw new AppException('Invalid status.', HttpStatus.BAD_REQUEST);
      }

      data.status = taskStatus;
    }

    const dataUpdated = await this.prismaService.task.update({
      where: { id },
      data,
    });

    this.rabbitMQService.send('update-task', {
      message: 'Teste de log',
      data: { userId, data: dataUpdated },
    });
  }

  async remove(id: string) {
    return this.prismaService.task.delete({
      where: { id },
    });
  }
}
