import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

const OTP_EXPIRY_MINUTES = 5;

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  emailOrPhone: string;

  @Column({ length: 255 })
  hashedOtp: string;

  @CreateDateColumn()
  createdAt: Date;

  isExpired(): boolean {
    const expiry = new Date(this.createdAt.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
    return new Date() > expiry;
  }
}
