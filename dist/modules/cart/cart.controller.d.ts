import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/add-cart-item.dto';
import { User } from '../user/entities/user.entity';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(user: User): Promise<import("./entities/cart.entity").Cart>;
    addItem(user: User, dto: AddCartItemDto): Promise<import("./entities/cart.entity").Cart>;
    updateItem(user: User, itemId: string, dto: UpdateCartItemDto): Promise<import("./entities/cart.entity").Cart>;
    removeItem(user: User, itemId: string): Promise<import("./entities/cart.entity").Cart>;
}
