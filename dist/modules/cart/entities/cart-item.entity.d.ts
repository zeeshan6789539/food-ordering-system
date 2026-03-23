import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';
export declare class CartItem {
    id: string;
    cartId: string;
    cart: Cart;
    productId: string;
    product: Product;
    variantId: string;
    variant: ProductVariant;
    quantity: number;
}
