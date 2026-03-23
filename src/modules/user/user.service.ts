import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private normalizeEmailOrPhone(input: string): string {
    return input.trim().toLowerCase();
  }

  async register(dto: RegisterUserDto): Promise<Omit<User, 'password' | 'tokens'>> {
    const email = this.normalizeEmailOrPhone(dto.email);
    const phoneNumber = dto.phoneNumber.trim();
    const existingEmail = await this.userRepo.findOne({ where: { email } });
    if (existingEmail) throw new ConflictException('Email already registered');
    const existingPhone = await this.userRepo.findOne({ where: { phoneNumber } });
    if (existingPhone) throw new ConflictException('Phone number already registered');

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

  async findByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
    const normalized = this.normalizeEmailOrPhone(emailOrPhone);
    const isEmail = normalized.includes('@');
    if (isEmail) {
      return this.userRepo.findOne({ where: { email: normalized } });
    }
    return this.userRepo.findOne({ where: { phoneNumber: emailOrPhone.trim() } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, user.password);
  }
}
