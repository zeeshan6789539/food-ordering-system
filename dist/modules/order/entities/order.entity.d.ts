import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';
export type OrderStatus = 'pending' | 'paid';
export type PaymentType = 'card' | 'cash' | 'online' | 'other';
export declare class Order {
    id: string;
    orderId: string;
    userId: string;
    user: User;
    totalAmount: number;
    paymentType: PaymentType;
    status: OrderStatus;
    createdAt: Date;
    items: OrderItem[];
}
