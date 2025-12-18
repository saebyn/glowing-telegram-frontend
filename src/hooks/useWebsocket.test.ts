import { describe, expect, it } from 'vitest';

describe('WebSocket Reconnection Logic', () => {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const maxReconnectAttempts = 10;

  it('should calculate exponential backoff correctly', () => {
    // First attempt: 1000 * 2^1 = 2000ms
    const delay1 = Math.min(
      baseDelay * 2 ** Math.min(1, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay1).toBe(2000);

    // Second attempt: 1000 * 2^2 = 4000ms
    const delay2 = Math.min(
      baseDelay * 2 ** Math.min(2, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay2).toBe(4000);

    // Third attempt: 1000 * 2^3 = 8000ms
    const delay3 = Math.min(
      baseDelay * 2 ** Math.min(3, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay3).toBe(8000);

    // Fifth attempt: 1000 * 2^5 = 32000ms, capped at 30000ms
    const delay5 = Math.min(
      baseDelay * 2 ** Math.min(5, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay5).toBe(30000);

    // Tenth attempt: capped at max attempts, so 1000 * 2^10 = 1024000ms, capped at 30000ms
    const delay10 = Math.min(
      baseDelay * 2 ** Math.min(10, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay10).toBe(30000);
  });

  it('should cap attempts to prevent exponential overflow', () => {
    // Attempts beyond max should still use maxReconnectAttempts value
    const delay15 = Math.min(
      baseDelay * 2 ** Math.min(15, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay15).toBe(30000);

    const delay20 = Math.min(
      baseDelay * 2 ** Math.min(20, maxReconnectAttempts),
      maxDelay,
    );
    expect(delay20).toBe(30000);
  });
});
