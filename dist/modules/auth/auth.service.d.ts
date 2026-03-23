import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Otp } from './entities/otp.entity';
import { LoginUserDto, RequestOtpDto, VerifyOtpDto } from '../user/dto/login-user.dto';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly otpRepo;
    constructor(userService: UserService, jwtService: JwtService, otpRepo: Repository<Otp>);
    login(dto: LoginUserDto): Promise<{
        access_token: string;
        user: unknown;
    }>;
    requestOtp(dto: RequestOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        access_token: string;
        user: unknown;
    }>;
    cleanupExpiredOtps(): Promise<void>;
}
