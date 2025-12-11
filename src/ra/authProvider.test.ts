import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userManager } from '@/utilities/auth';
import authProvider from './authProvider';

// Mock the auth utility module
vi.mock('@/utilities/auth', () => ({
  userManager: {
    removeUser: vi.fn().mockResolvedValue(undefined),
    getUser: vi.fn(),
    signinRedirect: vi.fn(),
    signinCallback: vi.fn(),
    startSilentRenew: vi.fn(),
  },
  signoutRedirect: vi.fn().mockResolvedValue('https://example.com/logout'),
}));

describe('authProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logout', () => {
    it('should call userManager.removeUser when mocks are not enabled', async () => {
      // Set environment to disable mocks for this test
      vi.stubEnv('VITE_MOCKS_ENABLED', '');

      await authProvider.logout({});

      expect(userManager.removeUser).toHaveBeenCalledOnce();
    });

    it('should not call userManager.removeUser when mocks are enabled', async () => {
      // Set environment to enable mocks for this test
      vi.stubEnv('VITE_MOCKS_ENABLED', 'true');

      // Need to reload the module to pick up the new env var
      vi.resetModules();
      const { default: authProviderWithMocks } = await import('./authProvider');

      await authProviderWithMocks.logout({});

      // Since mocks are enabled, removeUser should not be called
      expect(userManager.removeUser).not.toHaveBeenCalled();
    });
  });
});
