import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { generateOrderId } from './order-id.util';
import { PlaceOrderDto } from './dto/place-order.dto';
import { ORDER_QUEUE } from './order.processor';

@Injectable()
export class OrderService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectQueue(ORDER_QUEUE)
    private readonly orderQueue: Queue,
  ) {}

  async placeOrder(user: User, dto: PlaceOrderDto): Promise<Order> {
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(Cart);
      const cart = await cartRepo
        .createQueryBuilder('cart')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('cart.items', 'items')
        .leftJoinAndSelect('items.variant', 'variant')
        .leftJoinAndSelect('items.product', 'product')
        .where('cart.userId = :userId', { userId: user.id })
        .getOne();

      if (!cart || !cart.items?.length) {
        throw new BadRequestException('Cart is empty');
      }

      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);
      const cartItemRepo = manager.getRepository(CartItem);

      const orderId = generateOrderId();
      const order = orderRepo.create({
        orderId,
        userId: user.id,
        totalAmount: cart.totalAmount,
        paymentType: dto.paymentType,
        status: 'pending',
      });
      const orderRow = await orderRepo.save(order);

      const items = cart.items.map((ci) =>
        orderItemRepo.create({
          orderId: orderRow.id,
          productId: ci.productId,
          productName: ci.product.name,
          variantId: ci.variantId,
          variantName: ci.variant.name,
          unitPrice: ci.variant.price,
          quantity: ci.quantity,
        }),
      );
      const savedItems = await orderItemRepo.save(items);
      orderRow.items = savedItems;

      await cartItemRepo.delete({ cartId: cart.id });
      await cartRepo.update(cart.id, { totalAmount: 0 });

      return orderRow;
    });

    await this.orderQueue.add(
      'process',
      {
        orderId: savedOrder.orderId,
        userId: user.id,
        totalAmount: Number(savedOrder.totalAmount),
        email: user.email,
      },
      { removeOnComplete: { count: 1000 } },
    );

    return savedOrder;
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, userId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderId(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderId, userId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }
}
