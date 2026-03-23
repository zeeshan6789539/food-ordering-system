"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../user/user.service");
const otp_entity_1 = require("./entities/otp.entity");
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const SALT_ROUNDS_OTP = 10;
const DEV_STATIC_OTP = '123456';
let AuthService = class AuthService {
    constructor(userService, jwtService, otpRepo) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.otpRepo = otpRepo;
    }
    async login(dto) {
        const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await this.userService.validatePassword(user, dto.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);
        const { password, tokens, ...safe } = user;
        return { access_token, user: safe };
    }
    async requestOtp(dto) {
        const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS_OTP);
        const key = dto.emailOrPhone.trim().toLowerCase();
        await this.otpRepo.delete({ emailOrPhone: key });
        await this.otpRepo.save(this.otpRepo.create({ emailOrPhone: key, hashedOtp }));
        return { message: 'OTP sent (check console in dev)' };
    }
    async verifyOtp(dto) {
        const key = dto.emailOrPhone.trim().toLowerCase();
        if (process.env.NODE_ENV === 'development' && dto.otp === DEV_STATIC_OTP) {
            const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            await this.otpRepo.delete({ emailOrPhone: key });
            const payload = { sub: user.id, email: user.email };
            const access_token = this.jwtService.sign(payload);
            const { password, tokens, ...safe } = user;
            return { access_token, user: safe };
        }
        const record = await this.otpRepo.findOne({
            where: { emailOrPhone: key },
            order: { createdAt: 'DESC' },
        });
        if (!record)
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        const expired = new Date(record.createdAt.getTime() + OTP_EXPIRY_MS) < new Date();
        if (expired) {
            await this.otpRepo.delete({ id: record.id });
            throw new common_1.UnauthorizedException('OTP expired');
        }
        const valid = await bcrypt.compare(dto.otp, record.hashedOtp);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid OTP');
        await this.otpRepo.delete({ id: record.id });
        const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);
        const { password, tokens, ...safe } = user;
        return { access_token, user: safe };
    }
    async cleanupExpiredOtps() {
        const cutoff = new Date(Date.now() - OTP_EXPIRY_MS);
        await this.otpRepo.delete({ createdAt: (0, typeorm_2.LessThan)(cutoff) });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(otp_entity_1.Otp)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map