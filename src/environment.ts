const {
  VITE_CONTENT_URL,
  VITE_API_URL,
  VITE_MOCKS_ENABLED,
  VITE_SITE_DOMAIN,
  VITE_WEBSOCKET_URL,
  VITE_APP_URL,
  VITE_TWITCH_CLIENT_ID,

  VITE_AWS_REGION,
  VITE_COGNITO_CLIENT_ID,
  VITE_COGNITO_USER_POOL_ID,
  VITE_COGNITO_DOMAIN,
  VITE_REDIRECT_URI,
  VITE_LOGOUT_URI,
} = import.meta.env;

const DEFAULT_API_URL = 'http://localhost:3000/api';
const DEFAULT_CONTENT_URL = 'http://localhost:3000/content/';

if (!VITE_CONTENT_URL) {
  console.warn(
    `VITE_CONTENT_URL environment variable is not set. Defaulting to ${DEFAULT_CONTENT_URL}`,
  );
}

if (!VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

if (!VITE_SITE_DOMAIN) {
  throw new Error('VITE_SITE_DOMAIN environment variable is not set');
}

if (!VITE_WEBSOCKET_URL) {
  throw new Error('VITE_WEBSOCKET_URL environment variable is not set');
}

if (!VITE_TWITCH_CLIENT_ID) {
  console.warn(
    'VITE_TWITCH_CLIENT_ID environment variable is not set. Twitch integration will not work.',
  );
}

// Cognito config validation
if (!VITE_AWS_REGION) {
  throw new Error('VITE_AWS_REGION environment variable is not set');
}

if (!VITE_COGNITO_CLIENT_ID) {
  throw new Error('VITE_COGNITO_CLIENT_ID environment variable is not set');
}

if (!VITE_COGNITO_USER_POOL_ID) {
  throw new Error('VITE_COGNITO_USER_POOL_ID environment variable is not set');
}

if (!VITE_COGNITO_DOMAIN) {
  throw new Error('VITE_COGNITO_DOMAIN environment variable is not set');
}

if (!VITE_REDIRECT_URI) {
  throw new Error('VITE_REDIRECT_URI environment variable is not set');
}

if (!VITE_LOGOUT_URI) {
  throw new Error('VITE_LOGOUT_URI environment variable is not set');
}

// Export constants for use throughout the app
export const CONTENT_URL: string = VITE_CONTENT_URL || DEFAULT_CONTENT_URL;
export const API_URL: string = VITE_API_URL || DEFAULT_API_URL;
export const MOCKS_ENABLED: boolean = VITE_MOCKS_ENABLED === 'true';
export const SITE_DOMAIN: string = VITE_SITE_DOMAIN;
export const WEBSOCKET_URL: string = VITE_WEBSOCKET_URL;
export const APP_URL: string = VITE_APP_URL || window.location.origin;
export const TWITCH_CLIENT_ID: string = VITE_TWITCH_CLIENT_ID;
export const AWS_REGION: string = VITE_AWS_REGION;
export const COGNITO_CLIENT_ID: string = VITE_COGNITO_CLIENT_ID;
export const COGNITO_USER_POOL_ID: string = VITE_COGNITO_USER_POOL_ID;
export const COGNITO_DOMAIN: string = VITE_COGNITO_DOMAIN;
export const REDIRECT_URI: string = VITE_REDIRECT_URI;
export const LOGOUT_URI: string = VITE_LOGOUT_URI;
