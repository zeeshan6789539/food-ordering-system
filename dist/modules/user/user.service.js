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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
let UserService = class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    normalizeEmailOrPhone(input) {
        return input.trim().toLowerCase();
    }
    async register(dto) {
        const email = this.normalizeEmailOrPhone(dto.email);
        const phoneNumber = dto.phoneNumber.trim();
        const existingEmail = await this.userRepo.findOne({ where: { email } });
        if (existingEmail)
            throw new common_1.ConflictException('Email already registered');
        const existingPhone = await this.userRepo.findOne({ where: { phoneNumber } });
        if (existingPhone)
            throw new common_1.ConflictException('Phone number already registered');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            name: dto.name,
            email,
            phoneNumber,
            password: hashedPassword,
        });
        const saved = await this.userRepo.save(user);
        const { password, tokens, ...rest } = saved;
        return rest;
    }
    async findByEmailOrPhone(emailOrPhone) {
        const normalized = this.normalizeEmailOrPhone(emailOrPhone);
        const isEmail = normalized.includes('@');
        if (isEmail) {
            return this.userRepo.findOne({ where: { email: normalized } });
        }
        return this.userRepo.findOne({ where: { phoneNumber: emailOrPhone.trim() } });
    }
    async findById(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async validatePassword(user, plainPassword) {
        return bcrypt.compare(plainPassword, user.password);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map