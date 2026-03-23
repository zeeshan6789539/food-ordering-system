import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare const ORDER_QUEUE = "orders";
export interface OrderJobPayload {
    orderId: string;
    userId: string;
    totalAmount: number;
    email?: string;
}
export declare class OrderProcessor extends WorkerHost {
    process(job: Job<OrderJobPayload>): Promise<void>;
}
