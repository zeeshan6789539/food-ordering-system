"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_variant_entity_1 = require("./entities/product-variant.entity");
let ProductService = class ProductService {
    constructor(productRepo, variantRepo) {
        this.productRepo = productRepo;
        this.variantRepo = variantRepo;
    }
    async create(dto) {
        const product = this.productRepo.create({
            name: dto.name,
            description: dto.description,
            basePrice: dto.basePrice ?? 0,
            imageUrl: dto.imageUrl,
        });
        const saved = await this.productRepo.save(product);
        if (dto.variants?.length) {
            const variants = dto.variants.map((v) => this.variantRepo.create({
                productId: saved.id,
                name: v.name,
                price: v.price,
            }));
            await this.variantRepo.save(variants);
        }
        return this.findOne(saved.id);
    }
    async findAll(activeOnly = true) {
        const qb = this.productRepo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.variants', 'v');
        if (activeOnly) {
            qb.where('p.isActive = :active', { active: true });
            qb.andWhere('(v.id IS NULL OR v.isActive = :vActive)', { vActive: true });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['variants'],
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, dto) {
        const product = await this.findOne(id);
        if (dto.name != null)
            product.name = dto.name;
        if (dto.description != null)
            product.description = dto.description;
        if (dto.basePrice != null)
            product.basePrice = Number(dto.basePrice);
        if (dto.imageUrl != null)
            product.imageUrl = dto.imageUrl;
        await this.productRepo.save(product);
        if (dto.variants?.length) {
            await this.variantRepo.delete({ productId: id });
            const variants = dto.variants.map((v) => this.variantRepo.create({
                productId: id,
                name: v.name,
                price: v.price,
            }));
            await this.variantRepo.save(variants);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productRepo.remove(product);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
//# sourceMappingURL=product.service.js.map