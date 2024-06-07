import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { RabbitMQService } from '../../lib/rabbit/rabbit-mq.service';
import { TaskService } from './task.service';
import { Prisma } from '@prisma/client';
import { QueryListDto } from './dtos/params.dto';
import { AppException } from '../../AppException';
import { HttpStatus } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let prismaService: PrismaService;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              count: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be able to create a task', async () => {
    const taskData: Prisma.TaskCreateInput = {
      name: 'New Task',
      status: 'PENDING',
      description: 'Description test',
      user_id: 'user-id-test',
    };

    await service.create(taskData);

    expect(prismaService.task.create).toHaveBeenCalledWith({
      data: taskData,
    });
  });

  it('should be able to find all tasks with pagination', async () => {
    const queryDto: QueryListDto = {
      name: 'Test Task',
      status: 'OPEN',
      id: null,
      limit: 10,
      page: 1,
    };

    const mockCountResult = 2;
    const mockFindManyResult = [
      {
        id: '1',
        name: 'Test Task 1',
        status: 'PENDING',
        description: 'Description test 1',
        user_id: 'user-id-test',
      },
      {
        id: '2',
        name: 'Test Task 2',
        status: 'PENDING',
        description: 'Description test 2',
        user_id: 'user-id-test',
      },
    ];

    prismaService.task.count = jest.fn().mockResolvedValue(mockCountResult);
    prismaService.task.findMany = jest
      .fn()
      .mockResolvedValue(mockFindManyResult);

    const result = await service.findAll(queryDto);

    expect(result).toEqual({
      data: mockFindManyResult,
      limit: 10,
      total: mockCountResult,
      totalPage: 1,
      page: 1,
    });
  });

  it('should be able to find one task by id', async () => {
    const taskId = 'uuid-test';
    const mockTask = {
      id: taskId,
      name: 'Test Task',
      status: 'PENDING',
      description: 'Description test',
      user_id: 'user-id-test',
    };

    prismaService.task.findUnique = jest.fn().mockResolvedValue(mockTask);

    const result = await service.findOne(taskId);

    expect(prismaService.task.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(result).toEqual({ task: mockTask });
  });

  it('should not be able to find a task with non-existent id', async () => {
    const taskId = 'id-non-exists';
    const mockTask = null;

    prismaService.task.findUnique = jest.fn().mockResolvedValue(mockTask);

    await expect(service.findOne(taskId)).rejects.toThrowError(
      new AppException('Task not found.', HttpStatus.NOT_FOUND),
    );

    expect(prismaService.task.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
    });
  });

  it('should be able to update task and send message to RabbitMQ', async () => {
    const taskId = 'uuid-test';
    const userId = 'user-id-test';
    const taskDataToUpdate: Prisma.TaskUpdateInput = {
      name: 'Updated Task',
      status: 'IN_PROGRESS',
      description: 'Description test',
      user_id: 'user-id-test',
    };
    const updatedTask = { id: taskId, ...taskDataToUpdate };

    prismaService.task.findUnique = jest.fn().mockResolvedValue(updatedTask);
    prismaService.task.update = jest.fn().mockResolvedValue(updatedTask);

    await service.update(taskId, taskDataToUpdate, userId);

    expect(prismaService.task.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(prismaService.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: taskDataToUpdate,
    });
  });

  it('should not be able to update a task with non-existent id', async () => {
    const taskId = 'uuid-test';
    const taskDataToUpdate: Prisma.TaskUpdateInput = {
      name: 'Updated Task',
      status: 'IN_PROGRESS',
    };
    const userId = 'user123';

    prismaService.task.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      service.update(taskId, taskDataToUpdate, userId),
    ).rejects.toThrowError(
      new AppException('Task not found.', HttpStatus.NOT_FOUND),
    );

    expect(prismaService.task.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(prismaService.task.update).not.toHaveBeenCalled();
  });

  it('should be able to remove task by id', async () => {
    const taskId = 'uuid-test';

    await service.remove(taskId);

    expect(prismaService.task.delete).toHaveBeenCalledWith({
      where: { id: taskId },
    });
  });
});
