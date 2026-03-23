import { ProductVariant } from './product-variant.entity';
export declare class Product {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    variants: ProductVariant[];
}
