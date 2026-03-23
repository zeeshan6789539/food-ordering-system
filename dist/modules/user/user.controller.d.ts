import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    register(dto: RegisterUserDto): Promise<Omit<import("./entities/user.entity").User, "password" | "tokens">>;
}
