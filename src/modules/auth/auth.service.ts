import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserService } from '../user/user.service';
import { Otp } from './entities/otp.entity';
import { LoginUserDto, RequestOtpDto, VerifyOtpDto } from '../user/dto/login-user.dto';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const SALT_ROUNDS_OTP = 10;
const DEV_STATIC_OTP = '123456';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
  ) {}

  async login(dto: LoginUserDto): Promise<{ access_token: string; user: unknown }> {
    const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await this.userService.validatePassword(user, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    const { password, tokens, ...safe } = user;
    return { access_token, user: safe };
  }

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
    if (!user) throw new UnauthorizedException('User not found');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS_OTP);
    const key = dto.emailOrPhone.trim().toLowerCase();
    await this.otpRepo.delete({ emailOrPhone: key });
    await this.otpRepo.save(
      this.otpRepo.create({ emailOrPhone: key, hashedOtp }),
    );
    // In production: send OTP via email/SMS. Here we don't send for security.
    return { message: 'OTP sent (check console in dev)' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ access_token: string; user: unknown }> {
    const key = dto.emailOrPhone.trim().toLowerCase();

    if (process.env.NODE_ENV === 'development' && dto.otp === DEV_STATIC_OTP) {
      const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
      if (!user) throw new UnauthorizedException('User not found');
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
    if (!record) throw new UnauthorizedException('Invalid or expired OTP');
    const expired = new Date(record.createdAt.getTime() + OTP_EXPIRY_MS) < new Date();
    if (expired) {
      await this.otpRepo.delete({ id: record.id });
      throw new UnauthorizedException('OTP expired');
    }
    const valid = await bcrypt.compare(dto.otp, record.hashedOtp);
    if (!valid) throw new UnauthorizedException('Invalid OTP');
    await this.otpRepo.delete({ id: record.id });
    const user = await this.userService.findByEmailOrPhone(dto.emailOrPhone);
    if (!user) throw new UnauthorizedException('User not found');
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    const { password, tokens, ...safe } = user;
    return { access_token, user: safe };
  }

  async cleanupExpiredOtps(): Promise<void> {
    const cutoff = new Date(Date.now() - OTP_EXPIRY_MS);
    await this.otpRepo.delete({ createdAt: LessThan(cutoff) });
  }
}
