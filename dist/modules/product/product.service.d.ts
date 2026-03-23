import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private readonly productRepo;
    private readonly variantRepo;
    constructor(productRepo: Repository<Product>, variantRepo: Repository<ProductVariant>);
    create(dto: CreateProductDto): Promise<Product>;
    findAll(activeOnly?: boolean): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
}
