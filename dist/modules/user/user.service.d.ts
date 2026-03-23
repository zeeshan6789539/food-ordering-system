import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
export declare class UserService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    private normalizeEmailOrPhone;
    register(dto: RegisterUserDto): Promise<Omit<User, 'password' | 'tokens'>>;
    findByEmailOrPhone(emailOrPhone: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    validatePassword(user: User, plainPassword: string): Promise<boolean>;
}
