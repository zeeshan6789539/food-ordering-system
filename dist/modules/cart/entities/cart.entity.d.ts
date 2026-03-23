import { User } from '../../user/entities/user.entity';
import { CartItem } from './cart-item.entity';
export declare class Cart {
    id: string;
    userId: string;
    user: User;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    items: CartItem[];
}
