export declare class VariantDto {
    name: string;
    price: number;
}
export declare class CreateProductDto {
    name: string;
    description?: string;
    basePrice?: number;
    imageUrl?: string;
    variants: VariantDto[];
}
