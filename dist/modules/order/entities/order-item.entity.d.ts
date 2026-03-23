import { Order } from './order.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    unitPrice: number;
    quantity: number;
}
