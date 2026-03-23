import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { AddCartItemDto, UpdateCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
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

  async addItem(user: User, dto: AddCartItemDto): Promise<Cart> {
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variantId, productId: dto.productId },
    });
    if (!variant) throw new BadRequestException('Invalid product or variant');
    const cart = await this.getOrCreateCart(user.id);
    let item = await this.cartItemRepo.findOne({
      where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId },
    });
    if (item) {
      item.quantity += dto.quantity;
      await this.cartItemRepo.save(item);
    } else {
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

  async updateItem(user: User, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(user.id);
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    await this.cartItemRepo.save(item);
    await this.recalculateTotal(cart.id);
    return this.getOrCreateCart(user.id);
  }

  async removeItem(user: User, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(user.id);
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartItemRepo.remove(item);
    await this.recalculateTotal(cart.id);
    return this.getOrCreateCart(user.id);
  }

  async getCart(user: User): Promise<Cart> {
    return this.getOrCreateCart(user.id);
  }

  private async recalculateTotal(cartId: string): Promise<void> {
    const items = await this.cartItemRepo.find({
      where: { cartId },
      relations: ['variant'],
    });
    const total = items.reduce(
      (sum, i) => sum + Number(i.variant.price) * i.quantity,
      0,
    );
    await this.cartRepo.update(cartId, { totalAmount: total });
  }
}
