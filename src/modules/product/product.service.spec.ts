import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';

describe('ProductService', () => {
  let service: ProductService;

  const productRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const variantRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(ProductVariant), useValue: variantRepo },
      ],
    }).compile();
    service = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when missing', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('should return product when found', async () => {
      const product = { id: 'p1', name: 'Burger', variants: [] } as unknown as Product;
      productRepo.findOne.mockResolvedValue(product);
      await expect(service.findOne('p1')).resolves.toBe(product);
    });
  });

  describe('findAll', () => {
    it('should return query builder results', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      productRepo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.findAll()).resolves.toEqual([]);
      expect(qb.getMany).toHaveBeenCalled();
    });
  });
});
