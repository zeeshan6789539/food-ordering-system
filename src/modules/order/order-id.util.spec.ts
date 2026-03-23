import { generateOrderId } from './order-id.util';

describe('generateOrderId', () => {
  it('should start with ORD-', () => {
    expect(generateOrderId().startsWith('ORD-')).toBe(true);
  });

  it('should have length 12 (ORD- + 8 chars)', () => {
    expect(generateOrderId()).toHaveLength(12);
  });

  it('should generate different ids', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) ids.add(generateOrderId());
    expect(ids.size).toBe(100);
  });
});
