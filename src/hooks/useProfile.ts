import type { TwitchAccess } from '@/types';
import { useGetIdentity, useGetOne } from 'react-admin';

export interface Profile {
  id: string;
  accessToken: string;
  email: string;
  avatar: string;
  fullName: string;
  timezone: string;
  standardTags: string[];
  twitch?: {
    accessToken: string;
    broadcasterId: string;
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
  } = useGetOne<TwitchAccess>(
    'twitch',
    {
      id: 'twitchToken',
    },
    {
      enabled: !!identity,
    },
  );

  if (!identity || isPending || twitchTokenIsPending) {
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
      },
    },
  };
}

export default useProfile;
