import { AuthService } from './auth.service';
import { LoginUserDto, RequestOtpDto, VerifyOtpDto } from '../user/dto/login-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
