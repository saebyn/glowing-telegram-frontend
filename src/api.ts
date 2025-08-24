import { userManager } from '@/utilities/auth';
import type {
  TwitchAuthRequest,
  TwitchCallbackRequest,
  YouTubeCallbackRequest,
} from '@saebyn/glowing-telegram-types';

const { VITE_API_URL: baseApiUrl, VITE_MOCKS_ENABLED: MOCKS_ENABLED } =
  import.meta.env;

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

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  // If mocks are enabled, return mock user and let MSW handle the request
  if (MOCKS_ENABLED) {
    return fetch(url, {
      ...options,
      headers: {
        Authorization: mockUser.id_token,
        Accept: 'application/json',
        ...options.headers,
      },
    });
  }

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

export async function uploadEpisodesToYoutube(
  episodeIds: string[],
): Promise<void> {
  const url = new URL('upload/youtube', baseApiUrl);

  const res = await authenticatedFetch(url.toString(), {
    method: 'POST',
    body: JSON.stringify({
      episode_ids: episodeIds,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to upload episode to YouTube');
  }
}

export async function getEventSubChatStatus(): Promise<{
  subscribed: boolean;
}> {
  const url = new URL('eventsub/chat/status', baseApiUrl);

  const res = await authenticatedFetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to get EventSub chat status');
  }

  return res.json();
}

export async function subscribeToEventSubChat(): Promise<void> {
  const url = new URL('eventsub/chat/subscribe', baseApiUrl);

  const res = await authenticatedFetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to subscribe to EventSub chat');
  }
}

export async function unsubscribeFromEventSubChat(): Promise<void> {
  const url = new URL('eventsub/chat/subscribe', baseApiUrl);

  const res = await authenticatedFetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to unsubscribe from EventSub chat');
  }
}
