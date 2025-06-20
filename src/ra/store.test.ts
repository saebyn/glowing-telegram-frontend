import { describe, expect, it } from 'vitest';
import store from './store';

describe('store', () => {
  it('should create a store instance with expected interface', () => {
    expect(store).toBeDefined();
    expect(typeof store.getItem).toBe('function');
    expect(typeof store.setItem).toBe('function');
    expect(typeof store.removeItem).toBe('function');
    expect(typeof store.removeItems).toBe('function');
    expect(typeof store.reset).toBe('function');
  });

  it('should handle basic get/set operations', () => {
    const key = 'test-key';
    const value = { filter: { q: 'test' } };
    
    // Test basic functionality without mocking internal implementation
    store.setItem(key, value);
    const result = store.getItem(key, null);
    
    // The store should handle persistence internally
    expect(result).toEqual(value);
  });
});