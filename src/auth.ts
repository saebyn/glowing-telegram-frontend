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
});

export async function signoutRedirect() {
  return `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}

export async function createPasskey(accessToken: string) {
  console.assert(window.navigator.credentials, 'WebAuthn not supported');

  const startCommand = new StartWebAuthnRegistrationCommand({
    AccessToken: accessToken,
  });

  const startCommandResult = await client.send(startCommand);

  if (!startCommandResult.CredentialCreationOptions) {
    throw new Error('CredentialCreationOptions not found');
  }

  const createCredentialOptions =
    // biome-ignore lint/suspicious/noExplicitAny: parseCreationOptionsFromJSON exists but is not typed
    (PublicKeyCredential as any).parseCreationOptionsFromJSON(
      startCommandResult.CredentialCreationOptions,
    );

  console.log('createCredentialOptions2', createCredentialOptions);

  const credential = await window.navigator.credentials.create({
    publicKey: createCredentialOptions,
  });

  console.log('Credential', credential);

  if (!credential) {
    throw new Error('Credential not found');
  }

  const completeCommand = new CompleteWebAuthnRegistrationCommand({
    AccessToken: accessToken,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Credential: credential as any,
  });

  const completeCommandResult = await client.send(completeCommand);

  console.log('CompleteCommandResult', completeCommandResult);
}
