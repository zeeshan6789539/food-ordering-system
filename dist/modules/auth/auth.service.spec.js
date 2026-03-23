"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("../user/user.service");
const otp_entity_1 = require("./entities/otp.entity");
const mockUser = {
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
    let service;
    let userService;
    let jwtService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: user_service_1.UserService,
                    useValue: {
                        findByEmailOrPhone: jest.fn(),
                        validatePassword: jest.fn(),
                        findById: jest.fn(),
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(otp_entity_1.Otp),
                    useValue: { findOne: jest.fn(), delete: jest.fn(), save: jest.fn(), create: jest.fn((x) => x) },
                },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        userService = module.get(user_service_1.UserService);
        jwtService = module.get(jwt_1.JwtService);
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
            await expect(service.login({ emailOrPhone: 'unknown@example.com', password: 'pass' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException when password invalid', async () => {
            jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(mockUser);
            jest.spyOn(userService, 'validatePassword').mockResolvedValue(false);
            await expect(service.login({ emailOrPhone: 'test@example.com', password: 'wrong' })).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map