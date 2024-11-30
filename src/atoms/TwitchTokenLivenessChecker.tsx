import { checkTokenLiveness } from '@/twitch';
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

    checkTokenLiveness(twitchToken, { signal: abortController.signal })
      .then((isLive) => {
        console.log('twitch token is live:', isLive);
        if (!isLive) {
          clearToken();
        }
      })
      .catch(() => {});

    const interval = setInterval(
      async () => {
        try {
          // check if the token is still valid
          if (
            await checkTokenLiveness(twitchToken, {
              signal: abortController.signal,
            })
          ) {
            clearToken();
          }
        } catch (error) {}
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
