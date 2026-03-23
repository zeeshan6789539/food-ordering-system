"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderId = generateOrderId;
function generateOrderId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'ORD-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
//# sourceMappingURL=order-id.util.js.map