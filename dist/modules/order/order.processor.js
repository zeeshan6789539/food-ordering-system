"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessor = exports.ORDER_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
exports.ORDER_QUEUE = 'orders';
let OrderProcessor = class OrderProcessor extends bullmq_1.WorkerHost {
    async process(job) {
        const { orderId, userId, totalAmount, email } = job.data;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[OrderProcessor] Processing order ${orderId} for user ${userId}, total ${totalAmount}`);
            if (email)
                console.log(`[OrderProcessor] Would send email to ${email}`);
        }
    }
};
exports.OrderProcessor = OrderProcessor;
exports.OrderProcessor = OrderProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(exports.ORDER_QUEUE)
], OrderProcessor);
//# sourceMappingURL=order.processor.js.map