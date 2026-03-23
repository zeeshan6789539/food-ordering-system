import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  cartId: string;

  @ManyToOne(() => Cart, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('uuid')
  variantId: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
