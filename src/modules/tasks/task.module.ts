import { Module } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [TaskService, PrismaService, JwtService],
  controllers: [TaskController],
})
export class TaskModule {}
