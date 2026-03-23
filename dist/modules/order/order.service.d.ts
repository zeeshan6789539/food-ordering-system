import { Queue } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from './entities/order.entity';
import { PlaceOrderDto } from './dto/place-order.dto';
export declare class OrderService {
    private readonly dataSource;
    private readonly orderRepo;
    private readonly orderQueue;
    constructor(dataSource: DataSource, orderRepo: Repository<Order>, orderQueue: Queue);
    placeOrder(user: User, dto: PlaceOrderDto): Promise<Order>;
    findOne(id: string, userId: string): Promise<Order>;
    findByOrderId(orderId: string, userId: string): Promise<Order>;
    findMyOrders(userId: string): Promise<Order[]>;
}
