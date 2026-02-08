import { useGetIdentity, useGetOne } from 'react-admin';

export interface Profile {
  id: string;
  accessToken: string;
  email: string;
  avatar: string;
  fullName: string;
  timezone: string;
  standardTags: string[];
  twitchChatEnabled?: boolean;
  promptTemplate?: string;
  summaryTemplate?: string;
  twitch?: {
    accessToken: string;
    broadcasterId: string;
    login: string;
  };
  youtube?: {
    accessToken: string;
  };
}

type Return =
  | {
      status: 'success';
      profile: Profile;
      error: undefined;
      isPending: false;
    }
  | {
      status: 'error';
      profile: undefined;
      isPending: false;
      error: Error;
    }
  | {
      status: 'pending';
      profile: undefined;
      isPending: true;
      error: undefined;
    };

function useProfile(): Return {
  const { identity } = useGetIdentity();
  const {
    data: profile,
    isPending,
    error,
  } = useGetOne(
    'profile',
    { id: 'my-profile' },
    {
      enabled: !!identity,
    },
  );

  const {
    data: twitchToken,
    isPending: twitchTokenIsPending,
    error: twitchTokenError,
  } = useGetOne(
    'twitch',
    {
      id: 'twitchToken',
    },
    {
      enabled: !!identity,
    },
  );

  const {
    data: youtubeToken,
    isPending: youtubeTokenIsPending,
    error: youtubeTokenError,
  } = useGetOne(
    'youtube',
    {
      id: 'youtubeToken',
    },
    {
      enabled: !!identity,
    },
  );

  if (!identity || isPending || twitchTokenIsPending || youtubeTokenIsPending) {
    return {
      isPending: true,
      error: undefined,
      status: 'pending',
      profile: undefined,
    };
  }

  if (error) {
    return { error, status: 'error', profile: undefined, isPending: false };
  }

  if (twitchTokenError) {
    return {
      error: twitchTokenError,
      status: 'error',
      profile: undefined,
      isPending: false,
    };
  }

  if (youtubeTokenError) {
    return {
      error: youtubeTokenError,
      status: 'error',
      profile: undefined,
      isPending: false,
    };
  }

  return {
    status: 'success',
    error: undefined,
    isPending: false,
    profile: {
      ...profile,
      id: 'my-profile',
      email: identity.email,
      fullName: identity.fullName,
      avatar: identity.avatar,
      accessToken: identity.accessToken,
      twitch: twitchToken.valid && {
        accessToken: twitchToken.accessToken,
        broadcasterId: twitchToken.id,
        login: twitchToken.login,
      },
      youtube: youtubeToken.valid && {
        accessToken: youtubeToken.accessToken,
      },
    },
  };
}

export default useProfile;
