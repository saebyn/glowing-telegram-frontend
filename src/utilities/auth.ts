import { UserManager } from 'oidc-client-ts';

import {
  COGNITO_CLIENT_ID as clientId,
  COGNITO_DOMAIN as domain,
  LOGOUT_URI as logoutUri,
  REDIRECT_URI as redirectUri,
  AWS_REGION as region,
  COGNITO_USER_POOL_ID as userPoolId,
} from '@/environment';

export const userManager = new UserManager({
  authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid profile email aws.cognito.signin.user.admin',

  redirectMethod: 'replace',
});

userManager.startSilentRenew();

export async function signoutRedirect() {
  return `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}&redirect_uri=${encodeURIComponent(logoutUri)}&response_type=code`;
}
