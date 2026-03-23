import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { User } from '../user/entities/user.entity';

describe('CartService', () => {
  let service: CartService;

  const cartRepo = {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(),
    update: jest.fn(),
  };

  const cartItemRepo = {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const variantRepo = {
    findOne: jest.fn(),
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: cartRepo },
        { provide: getRepositoryToken(CartItem), useValue: cartItemRepo },
        { provide: getRepositoryToken(ProductVariant), useValue: variantRepo },
      ],
    }).compile();
    service = module.get(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addItem', () => {
    it('should throw BadRequestException when variant invalid', async () => {
      variantRepo.findOne.mockResolvedValue(null);
      await expect(
        service.addItem(user, { productId: 'p1', variantId: 'v1', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem', () => {
    it('should throw NotFoundException when item missing', async () => {
      const cart = { id: 'c1', userId: user.id, totalAmount: 0, items: [] };
      cartRepo.findOne.mockResolvedValue(cart);
      cartItemRepo.findOne.mockResolvedValue(null);
      await expect(service.updateItem(user, 'missing', { quantity: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeItem', () => {
    it('should throw NotFoundException when item missing', async () => {
      const cart = { id: 'c1', userId: user.id, totalAmount: 0, items: [] };
      cartRepo.findOne.mockResolvedValue(cart);
      cartItemRepo.findOne.mockResolvedValue(null);
      await expect(service.removeItem(user, 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
