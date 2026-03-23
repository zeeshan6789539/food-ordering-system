"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const throttler_1 = require("@nestjs/throttler");
const user_module_1 = require("./modules/user/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const product_module_1 = require("./modules/product/product.module");
const cart_module_1 = require("./modules/cart/cart.module");
const order_module_1 = require("./modules/order/order.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 10 },
                { name: 'medium', ttl: 10000, limit: 50 },
                { name: 'long', ttl: 60000, limit: 100 },
            ]),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST ?? 'localhost',
                    port: parseInt(process.env.DB_PORT ?? '5432', 10),
                    username: process.env.DB_USER ?? 'postgres',
                    password: process.env.DB_PASSWORD ?? 'postgres',
                    database: process.env.DB_NAME ?? 'food_ordering',
                    autoLoadEntities: true,
                    synchronize: process.env.NODE_ENV !== 'production',
                    logging: process.env.NODE_ENV === 'development',
                }),
            }),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST ?? 'localhost',
                    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            product_module_1.ProductModule,
            cart_module_1.CartModule,
            order_module_1.OrderModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map