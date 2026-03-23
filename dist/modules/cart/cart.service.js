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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./entities/cart.entity");
const cart_item_entity_1 = require("./entities/cart-item.entity");
const product_variant_entity_1 = require("../product/entities/product-variant.entity");
let CartService = class CartService {
    constructor(cartRepo, cartItemRepo, variantRepo) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.variantRepo = variantRepo;
    }
    async getOrCreateCart(userId) {
        let cart = await this.cartRepo.findOne({
            where: { userId },
            relations: ['items', 'items.variant', 'items.product'],
        });
        if (!cart) {
            cart = this.cartRepo.create({ userId, totalAmount: 0 });
            cart = await this.cartRepo.save(cart);
        }
        return cart;
    }
    async addItem(user, dto) {
        const variant = await this.variantRepo.findOne({
            where: { id: dto.variantId, productId: dto.productId },
        });
        if (!variant)
            throw new common_1.BadRequestException('Invalid product or variant');
        const cart = await this.getOrCreateCart(user.id);
        let item = await this.cartItemRepo.findOne({
            where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId },
        });
        if (item) {
            item.quantity += dto.quantity;
            await this.cartItemRepo.save(item);
        }
        else {
            item = this.cartItemRepo.create({
                cartId: cart.id,
                productId: dto.productId,
                variantId: dto.variantId,
                quantity: dto.quantity,
            });
            await this.cartItemRepo.save(item);
        }
        await this.recalculateTotal(cart.id);
        return this.getOrCreateCart(user.id);
    }
    async updateItem(user, itemId, dto) {
        const cart = await this.getOrCreateCart(user.id);
        const item = await this.cartItemRepo.findOne({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        item.quantity = dto.quantity;
        await this.cartItemRepo.save(item);
        await this.recalculateTotal(cart.id);
        return this.getOrCreateCart(user.id);
    }
    async removeItem(user, itemId) {
        const cart = await this.getOrCreateCart(user.id);
        const item = await this.cartItemRepo.findOne({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        await this.cartItemRepo.remove(item);
        await this.recalculateTotal(cart.id);
        return this.getOrCreateCart(user.id);
    }
    async getCart(user) {
        return this.getOrCreateCart(user.id);
    }
    async recalculateTotal(cartId) {
        const items = await this.cartItemRepo.find({
            where: { cartId },
            relations: ['variant'],
        });
        const total = items.reduce((sum, i) => sum + Number(i.variant.price) * i.quantity, 0);
        await this.cartRepo.update(cartId, { totalAmount: total });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map