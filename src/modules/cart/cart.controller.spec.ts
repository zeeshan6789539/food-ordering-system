import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';

describe('CartController', () => {
  let controller: CartController;

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

  const mockCartService = {
    getCart: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCart', () => {
    it('should return cart for current user', async () => {
      const cart = { id: 'c1', userId: mockUser.id, totalAmount: 0, items: [] };
      mockCartService.getCart.mockResolvedValue(cart);
      await expect(controller.getCart(mockUser)).resolves.toEqual(cart);
      expect(mockCartService.getCart).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('addItem', () => {
    it('should delegate to CartService.addItem', async () => {
      const dto = { productId: 'p1', variantId: 'v1', quantity: 2 };
      const cart = { id: 'c1', items: [] };
      mockCartService.addItem.mockResolvedValue(cart);
      await expect(controller.addItem(mockUser, dto)).resolves.toEqual(cart);
      expect(mockCartService.addItem).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('updateItem', () => {
    it('should delegate to CartService.updateItem', async () => {
      const dto = { quantity: 3 };
      const cart = { id: 'c1', items: [] };
      mockCartService.updateItem.mockResolvedValue(cart);
      await expect(controller.updateItem(mockUser, 'item-1', dto)).resolves.toEqual(cart);
      expect(mockCartService.updateItem).toHaveBeenCalledWith(mockUser, 'item-1', dto);
    });
  });

  describe('removeItem', () => {
    it('should delegate to CartService.removeItem', async () => {
      const cart = { id: 'c1', items: [] };
      mockCartService.removeItem.mockResolvedValue(cart);
      await expect(controller.removeItem(mockUser, 'item-1')).resolves.toEqual(cart);
      expect(mockCartService.removeItem).toHaveBeenCalledWith(mockUser, 'item-1');
    });
  });
});
