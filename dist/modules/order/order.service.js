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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("../cart/entities/cart.entity");
const cart_item_entity_1 = require("../cart/entities/cart-item.entity");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_id_util_1 = require("./order-id.util");
const order_processor_1 = require("./order.processor");
let OrderService = class OrderService {
    constructor(dataSource, orderRepo, orderQueue) {
        this.dataSource = dataSource;
        this.orderRepo = orderRepo;
        this.orderQueue = orderQueue;
    }
    async placeOrder(user, dto) {
        const savedOrder = await this.dataSource.transaction(async (manager) => {
            const cartRepo = manager.getRepository(cart_entity_1.Cart);
            const cart = await cartRepo
                .createQueryBuilder('cart')
                .setLock('pessimistic_write')
                .leftJoinAndSelect('cart.items', 'items')
                .leftJoinAndSelect('items.variant', 'variant')
                .leftJoinAndSelect('items.product', 'product')
                .where('cart.userId = :userId', { userId: user.id })
                .getOne();
            if (!cart || !cart.items?.length) {
                throw new common_1.BadRequestException('Cart is empty');
            }
            const orderRepo = manager.getRepository(order_entity_1.Order);
            const orderItemRepo = manager.getRepository(order_item_entity_1.OrderItem);
            const cartItemRepo = manager.getRepository(cart_item_entity_1.CartItem);
            const orderId = (0, order_id_util_1.generateOrderId)();
            const order = orderRepo.create({
                orderId,
                userId: user.id,
                totalAmount: cart.totalAmount,
                paymentType: dto.paymentType,
                status: 'pending',
            });
            const orderRow = await orderRepo.save(order);
            const items = cart.items.map((ci) => orderItemRepo.create({
                orderId: orderRow.id,
                productId: ci.productId,
                productName: ci.product.name,
                variantId: ci.variantId,
                variantName: ci.variant.name,
                unitPrice: ci.variant.price,
                quantity: ci.quantity,
            }));
            const savedItems = await orderItemRepo.save(items);
            orderRow.items = savedItems;
            await cartItemRepo.delete({ cartId: cart.id });
            await cartRepo.update(cart.id, { totalAmount: 0 });
            return orderRow;
        });
        await this.orderQueue.add('process', {
            orderId: savedOrder.orderId,
            userId: user.id,
            totalAmount: Number(savedOrder.totalAmount),
            email: user.email,
        }, { removeOnComplete: { count: 1000 } });
        return savedOrder;
    }
    async findOne(id, userId) {
        const order = await this.orderRepo.findOne({
            where: { id, userId },
            relations: ['items'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findByOrderId(orderId, userId) {
        const order = await this.orderRepo.findOne({
            where: { orderId, userId },
            relations: ['items'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findMyOrders(userId) {
        return this.orderRepo.find({
            where: { userId },
            relations: ['items'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, bullmq_1.InjectQueue)(order_processor_1.ORDER_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        bullmq_2.Queue])
], OrderService);
//# sourceMappingURL=order.service.js.map