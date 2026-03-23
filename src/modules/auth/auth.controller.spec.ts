import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return auth payload from AuthService', async () => {
      const dto = { emailOrPhone: 'test@example.com', password: 'secret' };
      const result = { access_token: 'jwt', user: { id: '1', email: 'test@example.com' } };
      mockAuthService.login.mockResolvedValue(result);
      await expect(controller.login(dto)).resolves.toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('requestOtp', () => {
    it('should return message from AuthService', async () => {
      const dto = { emailOrPhone: 'test@example.com' };
      const result = { message: 'OTP sent' };
      mockAuthService.requestOtp.mockResolvedValue(result);
      await expect(controller.requestOtp(dto)).resolves.toEqual(result);
      expect(mockAuthService.requestOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyOtp', () => {
    it('should return auth payload from AuthService', async () => {
      const dto = { emailOrPhone: 'test@example.com', otp: '123456' };
      const result = { access_token: 'jwt', user: { id: '1' } };
      mockAuthService.verifyOtp.mockResolvedValue(result);
      await expect(controller.verifyOtp(dto)).resolves.toEqual(result);
      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(dto);
    });
  });
});
