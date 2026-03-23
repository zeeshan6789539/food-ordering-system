import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ORDER_QUEUE } from './order.processor';
import { User } from '../user/entities/user.entity';

function makeCartQueryBuilder(getOneResult: unknown) {
  return {
    setLock: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(getOneResult),
  };
}

describe('OrderService', () => {
  let service: OrderService;

  const orderRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const orderQueue = {
    add: jest.fn().mockResolvedValue(undefined),
  };

  type TxFn = (manager: unknown) => Promise<unknown>;
  let transactionImpl: (fn: TxFn) => Promise<unknown>;

  const dataSource = {
    transaction: jest.fn((fn: TxFn) => transactionImpl(fn)),
  };

  const user: User = {
    id: 'user-1',
    name: 'T',
    email: 't@e.com',
    phoneNumber: '+1',
    password: 'x',
    tokens: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    transactionImpl = async () => {
      throw new Error('transactionImpl not set');
    };
    dataSource.transaction.mockImplementation((fn: TxFn) => transactionImpl(fn));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getQueueToken(ORDER_QUEUE), useValue: orderQueue },
      ],
    }).compile();
    service = module.get(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw when order missing', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('o1', user.id)).rejects.toThrow(NotFoundException);
    });

    it('should return order when owned by user', async () => {
      const order = { id: 'o1', userId: user.id, items: [] };
      orderRepo.findOne.mockResolvedValue(order);
      await expect(service.findOne('o1', user.id)).resolves.toBe(order);
    });
  });

  describe('findMyOrders', () => {
    it('should return orders from repository', async () => {
      const orders = [{ id: 'o1' }];
      orderRepo.find.mockResolvedValue(orders);
      await expect(service.findMyOrders(user.id)).resolves.toBe(orders);
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { userId: user.id },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('placeOrder', () => {
    const dto = { paymentType: 'card' as const };

    it('should throw when cart is missing', async () => {
      const cartRepo = { createQueryBuilder: jest.fn().mockReturnValue(makeCartQueryBuilder(null)) };
      transactionImpl = async (fn: TxFn) => {
        const manager = {
          getRepository: (e: unknown) => {
            if (e === Cart) return cartRepo;
            throw new Error('unexpected repo');
          },
        };
        return fn(manager);
      };
      await expect(service.placeOrder(user, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw when cart has no items', async () => {
      const cart = { id: 'c1', items: [] };
      const cartRepo = {
        createQueryBuilder: jest.fn().mockReturnValue(makeCartQueryBuilder(cart)),
      };
      transactionImpl = async (fn: TxFn) => {
        const manager = {
          getRepository: (e: unknown) => {
            if (e === Cart) return cartRepo;
            throw new Error('unexpected repo');
          },
        };
        return fn(manager);
      };
      await expect(service.placeOrder(user, dto)).rejects.toThrow(BadRequestException);
    });

    it('should persist order, clear cart, and enqueue job', async () => {
      const cart = {
        id: 'cart-1',
        totalAmount: 20,
        items: [
          {
            productId: 'p1',
            variantId: 'v1',
            quantity: 2,
            product: { name: 'Pizza' },
            variant: { name: 'Large', price: 10 },
          },
        ],
      };

      const orderRow = {
        id: 'internal-order-id',
        orderId: 'ORD-FIXED123',
        userId: user.id,
        totalAmount: 20,
        paymentType: dto.paymentType,
        status: 'pending',
      };

      const cartRepo = {
        createQueryBuilder: jest.fn().mockReturnValue(makeCartQueryBuilder(cart)),
        update: jest.fn().mockResolvedValue(undefined),
      };

      const orderRepoTx = {
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({ ...orderRow }),
      };

      const orderItemRepoTx = {
        create: jest.fn((x) => x),
        save: jest.fn().mockResolvedValue([{ id: 'oi1' }]),
      };

      const cartItemRepoTx = {
        delete: jest.fn().mockResolvedValue(undefined),
      };

      transactionImpl = async (fn: TxFn) => {
        const manager = {
          getRepository: (e: unknown) => {
            if (e === Cart) return cartRepo;
            if (e === Order) return orderRepoTx;
            if (e === OrderItem) return orderItemRepoTx;
            if (e === CartItem) return cartItemRepoTx;
            throw new Error('unexpected entity');
          },
        };
        return fn(manager);
      };

      const result = await service.placeOrder(user, dto);

      expect(orderRepoTx.save).toHaveBeenCalled();
      expect(orderItemRepoTx.save).toHaveBeenCalled();
      expect(cartItemRepoTx.delete).toHaveBeenCalledWith({ cartId: cart.id });
      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, { totalAmount: 0 });
      expect(orderQueue.add).toHaveBeenCalledWith(
        'process',
        expect.objectContaining({
          orderId: orderRow.orderId,
          userId: user.id,
          totalAmount: 20,
          email: user.email,
        }),
        { removeOnComplete: { count: 1000 } },
      );
      expect(result.items).toEqual([{ id: 'oi1' }]);
    });
  });
});
