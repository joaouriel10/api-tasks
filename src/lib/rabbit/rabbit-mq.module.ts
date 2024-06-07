import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbit-mq.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'logs',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:qwe123@localhost:5672'],
          queue: 'rabbit-log',
        },
      },
    ]),
  ],
  controllers: [],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
