import type { AuthProvider } from 'react-admin';

import { signoutRedirect, userManager } from './auth';
import gravatar from './gravitar';

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
    const user = await userManager.getUser();

    if (!user) {
      await userManager.signinRedirect();
    }
  },
  async getIdentity() {
    console.log('getIdentity');
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
    };
  },
  async handleCallback() {
    console.log('handleCallback');
    await userManager.signinCallback();
  },
};

export default authProvider;
