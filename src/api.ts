import { userManager } from '@/utilities/auth';
import type {
  TwitchAuthRequest,
  TwitchCallbackRequest,
  YouTubeCallbackRequest,
} from '@saebyn/glowing-telegram-types/src/types';

const { VITE_API_URL: baseApiUrl } = import.meta.env;

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const user = await userManager.getUser();

  if (!user) {
    throw new Error('User not found');
  }

  const token = user.id_token;

  if (token === undefined) {
    throw new Error('User not authenticated');
  }

  return fetch(url, {
    ...options,
    headers: {
      Authorization: token,
      Accept: 'application/json',
      ...options.headers,
    },
  });
}

export async function fetchAccessToken(
  provider: 'twitch' | 'youtube',
): Promise<
  | { id: string; valid: true; accessToken: string }
  | { id: string; valid: false }
> {
  const url = new URL(`auth/${provider}/token`, baseApiUrl);

  try {
    const res = await authenticatedFetch(url.toString());

    const data = await res.json();

    return {
      valid: true,
      id: data.broadcaster_id,
      accessToken: data.access_token,
    };
  } catch (error) {
    return {
      id: 'twitchToken',
      valid: false,
    };
  }
}

export async function generateAuthorizeUri(
  provider: 'twitch' | 'youtube',
  scopes: string[],
): Promise<string> {
  const url = new URL(`auth/${provider}/url`, baseApiUrl);

  const body: TwitchAuthRequest = {
    scopes,
    redirect_uri: window.location.href,
  };

  const res = await authenticatedFetch(url.toString(), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  return data.url;
}

export async function handleOAuthCallback(
  provider: 'twitch' | 'youtube',
  code: string,
  state: string,
): Promise<string> {
  const body: TwitchCallbackRequest | YouTubeCallbackRequest = {
    code,
    state,
    scope: [],
  };

  const res = await authenticatedFetch(
    new URL(`auth/${provider}/callback`, baseApiUrl).toString(),
    {
      method: 'POST',
      body: JSON.stringify(body),
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await res.json();

  return data.url;
}
