import type { AuthProvider } from 'react-admin';

import { signoutRedirect, userManager } from './auth';
import gravatar from './gravitar';

const authProvider: AuthProvider = {
  async login({ returnTo }) {
    await userManager.signinRedirect({
      redirect_uri: returnTo,
    });
  },
  async logout() {
    return signoutRedirect();
  },
  async checkError(responseError) {
    console.log('checkError', responseError);

    // TODO

    return Promise.resolve();
  },
  async checkAuth() {
    return userManager.getUser().then((user) => {
      if (!user) {
        throw new Error();
      }
    });
  },
  async getIdentity() {
    const user = await userManager.getUser();

    if (!user) {
      return {
        id: '',
        fullName: '',
        avatar: '',
        email: '',
        accessToken: null,
      };
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
    await userManager.signinRedirectCallback();
  },
};

export default authProvider;
