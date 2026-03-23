"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_id_util_1 = require("./order-id.util");
describe('generateOrderId', () => {
    it('should start with ORD-', () => {
        expect((0, order_id_util_1.generateOrderId)().startsWith('ORD-')).toBe(true);
    });
    it('should have length 12 (ORD- + 8 chars)', () => {
        expect((0, order_id_util_1.generateOrderId)()).toHaveLength(12);
    });
    it('should generate different ids', () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++)
            ids.add((0, order_id_util_1.generateOrderId)());
        expect(ids.size).toBe(100);
    });
});
//# sourceMappingURL=order-id.util.spec.js.map