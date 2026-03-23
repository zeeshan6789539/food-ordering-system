import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Otp } from './entities/otp.entity';
import { User } from '../user/entities/user.entity';

const mockUser: User = {
  id: 'user-1',
  name: 'Test',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  password: '$2b$10$hashed',
  tokens: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let otpRepo: { findOne: jest.Mock; delete: jest.Mock; save: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmailOrPhone: jest.fn(),
            validatePassword: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: { findOne: jest.fn(), delete: jest.fn(), save: jest.fn(), create: jest.fn((x) => x) },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    otpRepo = module.get(getRepositoryToken(Otp));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token when credentials are valid', async () => {
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
      jest.spyOn(userService, 'validatePassword').mockResolvedValue(true);
      const result = await service.login({
        emailOrPhone: 'test@example.com',
        password: 'password123',
      });
      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(null);
      await expect(
        service.login({ emailOrPhone: 'unknown@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password invalid', async () => {
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
      jest.spyOn(userService, 'validatePassword').mockResolvedValue(false);
      await expect(
        service.login({ emailOrPhone: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestOtp', () => {
    it('should throw when user not found', async () => {
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(null);
      await expect(service.requestOtp({ emailOrPhone: 'nope@example.com' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should delete prior OTP, save new hash, return message', async () => {
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-otp' as never);
      const result = await service.requestOtp({ emailOrPhone: 'test@example.com' });
      expect(otpRepo.delete).toHaveBeenCalledWith({ emailOrPhone: 'test@example.com' });
      expect(otpRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });
  });

  describe('verifyOtp', () => {
    const origEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = origEnv;
    });

    it('should accept static OTP in development', async () => {
      process.env.NODE_ENV = 'development';
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
      const result = await service.verifyOtp({
        emailOrPhone: 'test@example.com',
        otp: '123456',
      });
      expect(result.access_token).toBe('jwt-token');
      expect(otpRepo.delete).toHaveBeenCalledWith({ emailOrPhone: 'test@example.com' });
    });

    it('should throw when OTP record missing (non-dev path)', async () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
      otpRepo.findOne.mockResolvedValue(null);
      await expect(
        service.verifyOtp({ emailOrPhone: 'test@example.com', otp: '999999' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token when OTP valid', async () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
      otpRepo.findOne.mockResolvedValue({
        id: 'otp-1',
        createdAt: new Date(),
        hashedOtp: 'stored',
        emailOrPhone: 'test@example.com',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await service.verifyOtp({
        emailOrPhone: 'test@example.com',
        otp: '111111',
      });
      expect(result.access_token).toBe('jwt-token');
      expect(otpRepo.delete).toHaveBeenCalled();
    });
  });
});
