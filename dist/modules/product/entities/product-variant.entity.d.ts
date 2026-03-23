import { Product } from './product.entity';
export declare class ProductVariant {
    id: string;
    productId: string;
    product: Product;
    name: string;
    price: number;
    isActive: boolean;
}
