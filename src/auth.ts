import { UserManager } from 'oidc-client-ts';

const {
  VITE_AWS_REGION: region,
  VITE_COGNITO_CLIENT_ID: clientId,
  VITE_COGNITO_USER_POOL_ID: userPoolId,
  VITE_COGNITO_DOMAIN: domain,
  VITE_REDIRECT_URI: redirectUri,
  VITE_LOGOUT_URI: logoutUri,
} = import.meta.env;

export const userManager = new UserManager({
  authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid profile email aws.cognito.signin.user.admin',

  redirectMethod: 'replace',
});

export async function signoutRedirect() {
  return `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
