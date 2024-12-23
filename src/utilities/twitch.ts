import { DateTime } from 'luxon';

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

export interface ContentClassificationLabel {
  id: string;
  is_enabled: boolean;
}

export interface ContentClassificationLabelDefinition {
  id: string;
  name: string;
  description: string;
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
  content_classification_labels: ContentClassificationLabel[];
  is_branded_content: boolean;
}

export interface ModifyChannelInformationPayload {
  game_id?: string | null;
  broadcaster_language?: string;
  title?: string;
  tags?: string[];
  content_classification_labels?: ContentClassificationLabel[];
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

export async function getContentClassificationLabels(
  locale: string,
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<ContentClassificationLabelDefinition[]> {
  const response = await fetch(
    `https://api.twitch.tv/helix/content_classification_labels?locale=${encodeURIComponent(locale)}`,
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

  throw new Error('Failed to get content classification labels');
}

/**
 * Start Commercial Response
 *
 * The response to a successful request to start a commercial, whether
 * an ad break was started or not.
 */
export interface StartCommercialResponse {
  /**
   * The length of the commercial you requested. If you request a commercial
   * that’s longer than 180 seconds, the API uses 180 seconds.
   */
  length: number;
  /**
   * A message that indicates whether Twitch was able to serve an ad.
   */
  message: string;
  /**
   * The number of seconds you must wait before running another commercial.
   */
  retry_after: number;
}

/**
 * Start Commercial
 *
 * Starts a commercial on the specified channel.
 *
 * NOTE: Only partners and affiliates may run commercials and they must be streaming live at the time.
 *
 * NOTE: Only the broadcaster may start a commercial; the broadcaster’s editors and moderators may not start commercials on behalf of the broadcaster.
 *
 * Authorization
 *
 * Requires a user access token that includes the channel:edit:commercial scope.
 *
 * @see https://dev.twitch.tv/docs/api/reference#start-commercial
 */
export async function startCommercial(
  broadcasterId: string,
  accessToken: string,
  length: number,
  options: { signal?: AbortSignal } = {},
): Promise<StartCommercialResponse> {
  const response = await fetch(
    'https://api.twitch.tv/helix/channels/commercial',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      body: JSON.stringify({
        broadcaster_id: broadcasterId,
        length,
      }),
      signal: options.signal,
    },
  );

  if (!response.ok) {
    throw new Error('Failed to start commercial');
  }

  const json = await response.json();
  return json.data[0];
}

/**
 * Get Ad Schedule
 *
 * This endpoint returns ad schedule related information, including snooze,
 * when the last ad was run, when the next ad is scheduled, and if the channel
 * is currently in pre-roll free time. Note that a new ad cannot be run until 8
 * minutes after running a previous ad.
 *
 * Authorization
 *
 * Requires a user access token that includes the channel:read:ads scope. The
 * user_id in the user access token must match the broadcaster_id.
 */
export interface GetAdScheduleResponse {
  /**
   * The number of snoozes available for the broadcaster.
   */
  snooze_count: number;
  /**
   * The time when when the broadcaster will gain an additional snooze.
   */
  snooze_refresh_at: DateTime;
  /**
   * The time when the next ad break is scheduled to run. Empty if the channel
   * has no ad scheduled or is not live.
   */
  next_ad_at: DateTime | null;
  /**
   * The length in seconds of the scheduled upcoming ad break.
   */
  duration: number;
  /**
   * Broadcaster’s last ad-break. Empty if the channel has not run an ad or is not live.
   */
  last_ad_at: DateTime | null;
  /**
   * The amount of pre-roll free time remaining for the channel in seconds.
   * 0 if they are currently not pre-roll free.
   */
  preroll_free_time: number;
}

export async function getAdSchedule(
  broadcasterId: string,
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<GetAdScheduleResponse> {
  const response = await fetch(
    `https://api.twitch.tv/helix/channels/ads?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
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
    const data = json.data[0];
    return {
      snooze_count: Number(data.snooze_count),
      duration: Number(data.duration),
      preroll_free_time: Number(data.preroll_free_time),
      snooze_refresh_at: DateTime.fromSeconds(data.snooze_refresh_at),
      next_ad_at: data.next_ad_at
        ? DateTime.fromSeconds(data.next_ad_at)
        : null,
      last_ad_at: data.last_ad_at
        ? DateTime.fromSeconds(data.last_ad_at)
        : null,
    };
  }

  throw new Error('Failed to get ad schedule');
}

export type SnoozeNextAdResponse = Omit<
  GetAdScheduleResponse,
  'last_ad_at' | 'preroll_free_time' | 'duration' | 'next_ad_at'
> & {
  next_ad_at: DateTime;
};

/**
 * Snooze Next Ad
 *
 * If available, pushes back the timestamp of the upcoming automatic mid-roll
 * ad by 5 minutes. This endpoint duplicates the snooze functionality in the
 * creator dashboard’s Ads Manager.
 *
 * Authorization
 *
 * Requires a user access token that includes the channel:manage:broadcast
 * scope.
 */
export async function snoozeNextAd(
  broadcasterId: string,
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<SnoozeNextAdResponse> {
  const response = await fetch(
    `https://api.twitch.tv/helix/channels/ads/schedule/snooze?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      signal: options.signal,
    },
  );

  if (response.ok) {
    const json = await response.json();
    const data = json.data[0];
    return {
      snooze_count: Number(data.snooze_count),
      snooze_refresh_at: DateTime.fromISO(data.snooze_refresh_at),
      next_ad_at: DateTime.fromISO(data.next_ad_at),
    };
  }

  throw new Error('Failed to snooze next ad');
}