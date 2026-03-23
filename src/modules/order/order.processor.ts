import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';

export const ORDER_QUEUE = 'orders';

export interface OrderJobPayload {
  orderId: string;
  userId: string;
  totalAmount: number;
  email?: string;
}

@Injectable()
@Processor(ORDER_QUEUE)
export class OrderProcessor extends WorkerHost {
  async process(job: Job<OrderJobPayload>): Promise<void> {
    const { orderId, userId, totalAmount, email } = job.data;
    // Long-running tasks: send confirmation email, push notification, etc.
    // For now we just log. In production: send email via SendGrid, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OrderProcessor] Processing order ${orderId} for user ${userId}, total ${totalAmount}`);
      if (email) console.log(`[OrderProcessor] Would send email to ${email}`);
    }
  }
}
