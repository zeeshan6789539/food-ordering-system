import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ProductController', () => {
  let controller: ProductController;

  const mockProductService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return products from ProductService', async () => {
      const products = [{ id: 'p1', name: 'Burger' }];
      mockProductService.findAll.mockResolvedValue(products);
      await expect(controller.findAll()).resolves.toEqual(products);
      expect(mockProductService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return one product by id', async () => {
      const product = { id: 'p1', name: 'Burger', variants: [] };
      mockProductService.findOne.mockResolvedValue(product);
      await expect(controller.findOne('p1')).resolves.toEqual(product);
      expect(mockProductService.findOne).toHaveBeenCalledWith('p1');
    });
  });

  describe('create', () => {
    it('should delegate to ProductService.create', async () => {
      const dto = { name: 'New', description: null, basePrice: 10, imageUrl: null, variants: [] };
      const created = { id: 'p2', ...dto };
      mockProductService.create.mockResolvedValue(created);
      await expect(controller.create(dto as never)).resolves.toEqual(created);
      expect(mockProductService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to ProductService.update', async () => {
      const dto = { name: 'Updated' };
      const updated = { id: 'p1', name: 'Updated' };
      mockProductService.update.mockResolvedValue(updated);
      await expect(controller.update('p1', dto as never)).resolves.toEqual(updated);
      expect(mockProductService.update).toHaveBeenCalledWith('p1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to ProductService.remove', async () => {
      mockProductService.remove.mockResolvedValue(undefined);
      await expect(controller.remove('p1')).resolves.toBeUndefined();
      expect(mockProductService.remove).toHaveBeenCalledWith('p1');
    });
  });
});
