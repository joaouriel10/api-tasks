import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './modules/tasks/task.module';
import { AuthModule } from './modules/auth/auth.module';
import { RabbitMQModule } from './lib/rabbit/rabbit-mq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TaskModule,
    AuthModule,
    RabbitMQModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
