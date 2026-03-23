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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpDto = exports.RequestOtpDto = exports.LoginUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class LoginUserDto {
}
exports.LoginUserDto = LoginUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com', description: 'Email or phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "emailOrPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecurePass123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], LoginUserDto.prototype, "password", void 0);
class RequestOtpDto {
}
exports.RequestOtpDto = RequestOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com', description: 'Email or phone to send OTP' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestOtpDto.prototype, "emailOrPhone", void 0);
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "emailOrPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(6),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
//# sourceMappingURL=login-user.dto.js.map