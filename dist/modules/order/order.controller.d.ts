import { OrderService } from './order.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { User } from '../user/entities/user.entity';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    placeOrder(user: User, dto: PlaceOrderDto): Promise<import("./entities/order.entity").Order>;
    findMyOrders(user: User): Promise<import("./entities/order.entity").Order[]>;
    findOne(user: User, id: string): Promise<import("./entities/order.entity").Order>;
}
