import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice ?? 0,
      imageUrl: dto.imageUrl,
    });
    const saved = await this.productRepo.save(product);
    if (dto.variants?.length) {
      const variants = dto.variants.map((v) =>
        this.variantRepo.create({
          productId: saved.id,
          name: v.name,
          price: v.price,
        }),
      );
      await this.variantRepo.save(variants);
    }
    return this.findOne(saved.id);
  }

  async findAll(activeOnly = true): Promise<Product[]> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v');
    if (activeOnly) {
      qb.where('p.isActive = :active', { active: true });
      qb.andWhere('(v.id IS NULL OR v.isActive = :vActive)', { vActive: true });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name != null) product.name = dto.name;
    if (dto.description != null) product.description = dto.description;
    if (dto.basePrice != null) product.basePrice = Number(dto.basePrice);
    if (dto.imageUrl != null) product.imageUrl = dto.imageUrl;
    await this.productRepo.save(product);
    if (dto.variants?.length) {
      await this.variantRepo.delete({ productId: id });
      const variants = dto.variants.map((v) =>
        this.variantRepo.create({
          productId: id,
          name: v.name,
          price: v.price,
        }),
      );
      await this.variantRepo.save(variants);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
  }
}
