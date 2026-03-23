import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findAll(): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    create(dto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    update(id: string, dto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
}
