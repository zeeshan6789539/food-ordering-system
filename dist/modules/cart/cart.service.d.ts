import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { AddCartItemDto, UpdateCartItemDto } from './dto/add-cart-item.dto';
export declare class CartService {
    private readonly cartRepo;
    private readonly cartItemRepo;
    private readonly variantRepo;
    constructor(cartRepo: Repository<Cart>, cartItemRepo: Repository<CartItem>, variantRepo: Repository<ProductVariant>);
    getOrCreateCart(userId: string): Promise<Cart>;
    addItem(user: User, dto: AddCartItemDto): Promise<Cart>;
    updateItem(user: User, itemId: string, dto: UpdateCartItemDto): Promise<Cart>;
    removeItem(user: User, itemId: string): Promise<Cart>;
    getCart(user: User): Promise<Cart>;
    private recalculateTotal;
}
