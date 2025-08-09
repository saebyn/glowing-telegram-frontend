import type { AuthProvider } from 'react-admin';

import { signoutRedirect, userManager } from '@/utilities/auth';
import gravatar from '@/utilities/gravitar';

const { VITE_MOCKS_ENABLED: MOCKS_ENABLED } = import.meta.env;

// Mock user for development when mocks are enabled
const mockUser = {
  profile: {
    sub: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
  },
  access_token: 'mock-access-token',
  id_token: 'mock-id-token',
};

const authProvider: AuthProvider = {
  async login() {},
  async logout() {
    console.log('logout');

    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    return signoutRedirect();
  },
  async checkError(responseError) {
    console.log('checkError', responseError);
    if (responseError?.message === 'Network Error') {
      return Promise.resolve();
    }

    if (responseError?.status === 401) {
      return Promise.reject();
    }

    return Promise.resolve();
  },
  async checkAuth() {
    console.log('checkAuth');

    // If mocks are enabled, skip real auth
    if (MOCKS_ENABLED) {
      return Promise.resolve();
    }

    const user = await userManager.getUser();

    if (!user) {
      await userManager.signinRedirect();
    }
  },
  async getIdentity() {
    console.log('getIdentity');

    // If mocks are enabled, return mock user
    if (MOCKS_ENABLED) {
      return {
        id: mockUser.profile.sub,
        fullName: mockUser.profile.name,
        avatar: gravatar(mockUser.profile.email, mockUser.profile.name),
        email: mockUser.profile.email,
        accessToken: mockUser.access_token,
        idToken: mockUser.id_token,
      };
    }

    const user = await userManager.getUser();

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.profile.sub,
      fullName: user.profile.name,
      avatar: gravatar(user.profile.email, user.profile.name),
      email: user.profile.email,
      accessToken: user.access_token,
      idToken: user.id_token,
    };
  },
  async handleCallback() {
    await userManager.signinCallback();
  },
};

export default authProvider;
