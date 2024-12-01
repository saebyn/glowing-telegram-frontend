import { validateAccessToken } from '@/twitch';
import useProfile from '@/useProfile';
import { useEffect } from 'react';
import { useUpdate } from 'react-admin';

function TwitchTokenLivenessChecker() {
  const { profile } = useProfile();
  const [update] = useUpdate();

  const twitchToken = profile?.twitch?.accessToken;

  const clearToken = () => {
    console.log('clearing twitch oauth token');
    update('profile', {
      id: 'my-profile',
      data: { twitch: { accessToken: null } },
    });
  };

  useEffect(() => {
    const abortController = new AbortController();

    if (!twitchToken) {
      return;
    }

    validateAccessToken(twitchToken, { signal: abortController.signal }).catch(
      () => {
        clearToken();
      },
    );

    const interval = setInterval(
      async () => {
        try {
          // check if the token is still valid
          await validateAccessToken(twitchToken, {
            signal: abortController.signal,
          });
        } catch (error) {
          clearToken();
        }
      },
      1000 * 60 * 60,
    ); // check every hour

    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  });

  return null;
}

export default TwitchTokenLivenessChecker;
