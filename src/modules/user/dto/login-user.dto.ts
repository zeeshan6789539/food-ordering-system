import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email or phone number' })
  @IsString()
  emailOrPhone: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email or phone to send OTP' })
  @IsString()
  emailOrPhone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  emailOrPhone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
