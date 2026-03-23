"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("../modules/user/entities/user.entity");
const product_entity_1 = require("../modules/product/entities/product.entity");
const product_variant_entity_1 = require("../modules/product/entities/product-variant.entity");
const cart_entity_1 = require("../modules/cart/entities/cart.entity");
const cart_item_entity_1 = require("../modules/cart/entities/cart-item.entity");
const order_entity_1 = require("../modules/order/entities/order.entity");
const order_item_entity_1 = require("../modules/order/entities/order-item.entity");
const order_id_util_1 = require("../modules/order/order-id.util");
(0, dotenv_1.config)();
const SALT_ROUNDS = 10;
async function run() {
    const ds = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'food_ordering',
        entities: [user_entity_1.User, product_entity_1.Product, product_variant_entity_1.ProductVariant, cart_entity_1.Cart, cart_item_entity_1.CartItem, order_entity_1.Order, order_item_entity_1.OrderItem],
        synchronize: false,
    });
    await ds.initialize();
    const userRepo = ds.getRepository(user_entity_1.User);
    const productRepo = ds.getRepository(product_entity_1.Product);
    const variantRepo = ds.getRepository(product_variant_entity_1.ProductVariant);
    const cartRepo = ds.getRepository(cart_entity_1.Cart);
    const cartItemRepo = ds.getRepository(cart_item_entity_1.CartItem);
    const orderRepo = ds.getRepository(order_entity_1.Order);
    const orderItemRepo = ds.getRepository(order_item_entity_1.OrderItem);
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
        console.log('Data already present (users exist). Skipping seed.');
        await ds.destroy();
        return;
    }
    const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
    const users = await userRepo.save([
        userRepo.create({ name: 'Alice Doe', email: 'alice@example.com', phoneNumber: '+15550000001', password: hashedPassword }),
        userRepo.create({ name: 'Bob Smith', email: 'bob@example.com', phoneNumber: '+15550000002', password: hashedPassword }),
        userRepo.create({ name: 'Carol Jones', email: 'carol@example.com', phoneNumber: '+15550000003', password: hashedPassword }),
    ]);
    const productsData = [
        { name: 'Margherita Pizza', description: 'Tomato, mozzarella, basil', basePrice: 12.99, imageUrl: null, variants: [{ name: 'Regular', price: 12.99 }, { name: 'Large', price: 16.99 }] },
        { name: 'Pepperoni Pizza', description: 'Tomato, mozzarella, pepperoni', basePrice: 14.99, imageUrl: null, variants: [{ name: 'Regular', price: 14.99 }, { name: 'Large', price: 18.99 }] },
        { name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, Caesar dressing', basePrice: 8.99, imageUrl: null, variants: [{ name: 'Half', price: 6.99 }, { name: 'Full', price: 8.99 }] },
        { name: 'Burger Classic', description: 'Beef patty, lettuce, tomato, onion', basePrice: 11.99, imageUrl: null, variants: [{ name: 'Single', price: 11.99 }, { name: 'Double', price: 14.99 }] },
        { name: 'Fish & Chips', description: 'Beer-battered cod, fries, tartar sauce', basePrice: 13.99, imageUrl: null, variants: [{ name: 'Regular', price: 13.99 }] },
        { name: 'Iced Coffee', description: 'Cold brew with ice', basePrice: 4.49, imageUrl: null, variants: [{ name: 'Small', price: 3.49 }, { name: 'Medium', price: 4.49 }, { name: 'Large', price: 5.49 }] },
    ];
    const savedProducts = [];
    const savedVariants = [];
    for (const p of productsData) {
        const product = await productRepo.save(productRepo.create({
            name: p.name,
            description: p.description,
            basePrice: p.basePrice,
            imageUrl: p.imageUrl,
            isActive: true,
        }));
        savedProducts.push(product);
        for (const v of p.variants) {
            const variant = await variantRepo.save(variantRepo.create({
                productId: product.id,
                name: v.name,
                price: v.price,
                isActive: true,
            }));
            savedVariants.push(variant);
        }
    }
    for (const user of users) {
        const cart = await cartRepo.save(cartRepo.create({
            userId: user.id,
            totalAmount: 0,
        }));
        const product1 = savedProducts[0];
        const variant1 = savedVariants[0];
        const product2 = savedProducts[2];
        const variant2 = savedVariants[4];
        await cartItemRepo.save([
            cartItemRepo.create({ cartId: cart.id, productId: product1.id, variantId: variant1.id, quantity: 2 }),
            cartItemRepo.create({ cartId: cart.id, productId: product2.id, variantId: variant2.id, quantity: 1 }),
        ]);
        const newTotal = Number(variant1.price) * 2 + Number(variant2.price) * 1;
        await cartRepo.update(cart.id, { totalAmount: newTotal });
    }
    const orderProduct = savedProducts[1];
    const orderVariant = savedVariants[2];
    const unitPrice = Number(orderVariant.price);
    const qty = 2;
    const totalAmount = unitPrice * qty;
    for (let i = 0; i < 2; i++) {
        const order = await orderRepo.save(orderRepo.create({
            orderId: (0, order_id_util_1.generateOrderId)(),
            userId: users[i].id,
            totalAmount,
            paymentType: i === 0 ? 'card' : 'cash',
            status: 'paid',
        }));
        await orderItemRepo.save(orderItemRepo.create({
            orderId: order.id,
            productId: orderProduct.id,
            productName: orderProduct.name,
            variantId: orderVariant.id,
            variantName: orderVariant.name,
            unitPrice,
            quantity: qty,
        }));
    }
    console.log('Seed done: 3 users, 6 products with variants, carts with items, 2 orders.');
    await ds.destroy();
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map