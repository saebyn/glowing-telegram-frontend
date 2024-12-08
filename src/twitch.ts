const {
  VITE_TWITCH_CLIENT_ID: clientId,
  VITE_TWITCH_REDIRECT_URI: redirectUri,
} = import.meta.env;

export function generateAuthorizeUri(
  csrfToken: string,
  scope: string[],
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: scope.join(' '),
    state: csrfToken,
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

interface ValidateAccessTokenResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
}

export async function validateAccessToken(
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<ValidateAccessTokenResponse> {
  const response = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
    signal: options.signal,
  });
  if (response.ok) {
    return response.json();
  }

  throw new Error('Invalid access token');
}

interface AuthorizeSuccess {
  status: 'success';
  accessToken: string;
}

interface AuthorizeError {
  status: 'error';
  error: string;
  errorDescription: string;
}

export function parseReturnedData(
  csrfToken: string,
  location: Location,
): AuthorizeError | AuthorizeSuccess {
  const params = new URLSearchParams(location.hash.slice(1));
  const searchParams = new URLSearchParams(location.search);

  if (searchParams.has('error')) {
    if (searchParams.get('state') !== csrfToken) {
      return {
        status: 'error',
        error: 'csrf_mismatch',
        errorDescription: 'CSRF token mismatch',
      };
    }

    return {
      status: 'error',
      error: searchParams.get('error') || 'unknown',
      errorDescription: searchParams.get('error_description') || 'unknown',
    };
  }

  if (params.get('state') !== csrfToken) {
    return {
      status: 'error',
      error: 'csrf_mismatch',
      errorDescription: 'CSRF token mismatch',
    };
  }
  return {
    status: 'success',
    accessToken: params.get('access_token') || '',
  };
}

export interface GetChannelInformationResponse {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string | null;
  game_name: string;
  title: string;
  tags: string[];
  content_classification_labels: {
    id: string;
    is_enabled: boolean;
  }[];
  is_branded_content: boolean;
}

export interface ModifyChannelInformationPayload {
  game_id?: string | null;
  broadcaster_language?: string;
  title?: string;
  tags?: string[];
  content_classification_labels?: {
    id: string;
    is_enabled: boolean;
  }[];
  is_branded_content?: boolean;
}

export async function getChannelInformation(
  broadcasterId: string,
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<GetChannelInformationResponse> {
  if (!accessToken) {
    throw new Error('Access token is missing');
  }

  if (!broadcasterId) {
    throw new Error('Broadcaster ID is missing');
  }

  const response = await fetch(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      signal: options.signal,
    },
  );

  if (response.ok) {
    const json = await response.json();

    if (json.data.length === 0) {
      throw new Error('Channel not found');
    }

    return {
      ...json.data[0],

      game_id: json.data[0].game_id || null,

      content_classification_labels:
        json.data[0].content_classification_labels.map((label: string) => ({
          id: label,
          is_enabled: true,
        })),
    };
  }

  throw new Error('Failed to get channel information');
}

export async function modifyChannelInformation(
  broadcasterId: string,
  accessToken: string,
  payload: ModifyChannelInformationPayload,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const response = await fetch(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        game_id: payload.game_id === null ? '' : payload.game_id,
      } as ModifyChannelInformationPayload),
      signal: options.signal,
    },
  );

  if (!response.ok) {
    throw new Error('Failed to modify channel information');
  }
}

export interface TwitchCategory {
  id: string;
  name: string;
  box_art_url?: string;
}

export async function searchCategories(
  query: string,
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<TwitchCategory[]> {
  const response = await fetch(
    `https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      signal: options.signal,
    },
  );

  if (response.ok) {
    const json = await response.json();
    return json.data;
  }

  throw new Error('Failed to search categories');
}
