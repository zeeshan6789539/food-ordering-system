import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderProcessor, ORDER_QUEUE } from './order.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    BullModule.registerQueue({
      name: ORDER_QUEUE,
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessor],
  exports: [OrderService],
})
export class OrderModule {}
