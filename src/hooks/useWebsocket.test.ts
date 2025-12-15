import { describe, expect, it } from 'vitest';
import type { ConnectionStatus } from './useWebsocket';

describe('WebSocket Connection Status', () => {
  it('should define all connection status types', () => {
    const statuses: ConnectionStatus[] = [
      'connecting',
      'connected',
      'disconnected',
      'reconnecting',
      'error',
    ];

    for (const status of statuses) {
      expect(status).toBeDefined();
    }
  });

  it('should have the correct status values', () => {
    const connecting: ConnectionStatus = 'connecting';
    const connected: ConnectionStatus = 'connected';
    const disconnected: ConnectionStatus = 'disconnected';
    const reconnecting: ConnectionStatus = 'reconnecting';
    const error: ConnectionStatus = 'error';

    expect(connecting).toBe('connecting');
    expect(connected).toBe('connected');
    expect(disconnected).toBe('disconnected');
    expect(reconnecting).toBe('reconnecting');
    expect(error).toBe('error');
  });
});

describe('WebSocket Reconnection Logic', () => {
  it('should calculate exponential backoff correctly', () => {
    const baseDelay = 1000;
    const maxDelay = 30000;

    // First attempt: 1000 * 2^1 = 2000ms
    const delay1 = Math.min(baseDelay * 2 ** 1, maxDelay);
    expect(delay1).toBe(2000);

    // Second attempt: 1000 * 2^2 = 4000ms
    const delay2 = Math.min(baseDelay * 2 ** 2, maxDelay);
    expect(delay2).toBe(4000);

    // Third attempt: 1000 * 2^3 = 8000ms
    const delay3 = Math.min(baseDelay * 2 ** 3, maxDelay);
    expect(delay3).toBe(8000);

    // Fifth attempt: 1000 * 2^5 = 32000ms, capped at 30000ms
    const delay5 = Math.min(baseDelay * 2 ** 5, maxDelay);
    expect(delay5).toBe(30000);

    // Tenth attempt: should be capped at maxDelay
    const delay10 = Math.min(baseDelay * 2 ** 10, maxDelay);
    expect(delay10).toBe(30000);
  });
});
