import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashed'),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      name: 'Test',
      email: 'Test@Example.com',
      phoneNumber: '+1234567890',
      password: 'secret',
    };

    it('should create user and omit password and tokens', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const saved: User = {
        id: 'u1',
        name: dto.name,
        email: 'test@example.com',
        phoneNumber: dto.phoneNumber,
        password: '$2b$10$hashed',
        tokens: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-01'),
      };
      mockRepo.save.mockResolvedValue(saved);

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockRepo.findOne).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('tokens');
      expect(result.email).toBe('test@example.com');
      expect(result.id).toBe('u1');
    });

    it('should throw ConflictException when email exists', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: 'x' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when phone exists', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'x' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmailOrPhone', () => {
    it('should find by normalized email when input contains @', async () => {
      const user = { id: 'u1' } as User;
      mockRepo.findOne.mockResolvedValue(user);
      const result = await service.findByEmailOrPhone('  A@B.COM  ');
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(result).toBe(user);
    });

    it('should find by phone when input has no @', async () => {
      const user = { id: 'u1' } as User;
      mockRepo.findOne.mockResolvedValue(user);
      const result = await service.findByEmailOrPhone('  +1555  ');
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { phoneNumber: '+1555' } });
      expect(result).toBe(user);
    });
  });
});
