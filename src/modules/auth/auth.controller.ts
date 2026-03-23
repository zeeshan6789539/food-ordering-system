import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto, RequestOtpDto, VerifyOtpDto } from '../user/dto/login-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email/phone and password' })
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('otp/request')
  @ApiOperation({ summary: 'Request OTP for passwordless login' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and get JWT' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}
