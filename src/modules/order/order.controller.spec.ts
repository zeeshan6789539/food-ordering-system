import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';

describe('OrderController', () => {
  let controller: OrderController;

  const mockUser: User = {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
    phoneNumber: '+1',
    password: 'x',
    tokens: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderService = {
    placeOrder: jest.fn(),
    findMyOrders: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('placeOrder', () => {
    it('should delegate to OrderService.placeOrder', async () => {
      const dto = { paymentType: 'card' as const };
      const order = { id: 'o1', orderId: 'ORD-XXXXXXXX', userId: mockUser.id };
      mockOrderService.placeOrder.mockResolvedValue(order);
      await expect(controller.placeOrder(mockUser, dto)).resolves.toEqual(order);
      expect(mockOrderService.placeOrder).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('findMyOrders', () => {
    it('should list orders for current user id', async () => {
      const orders = [{ id: 'o1', userId: mockUser.id }];
      mockOrderService.findMyOrders.mockResolvedValue(orders);
      await expect(controller.findMyOrders(mockUser)).resolves.toEqual(orders);
      expect(mockOrderService.findMyOrders).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return order by id for current user', async () => {
      const order = { id: 'o1', userId: mockUser.id };
      mockOrderService.findOne.mockResolvedValue(order);
      await expect(controller.findOne(mockUser, 'o1')).resolves.toEqual(order);
      expect(mockOrderService.findOne).toHaveBeenCalledWith('o1', mockUser.id);
    });
  });
});
