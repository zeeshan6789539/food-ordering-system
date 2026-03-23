import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();
    controller = module.get(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return created user from UserService', async () => {
      const dto = {
        name: 'Test',
        email: 'test@example.com',
        phoneNumber: '+10000000000',
        password: 'password123',
      };
      const result = {
        id: 'user-1',
        name: 'Test',
        email: 'test@example.com',
        phoneNumber: '+10000000000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.register.mockResolvedValue(result);
      await expect(controller.register(dto)).resolves.toEqual(result);
      expect(mockUserService.register).toHaveBeenCalledWith(dto);
    });
  });
});
