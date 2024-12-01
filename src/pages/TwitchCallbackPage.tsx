import { getCsrfToken } from '@/csrf';
import { parseReturnedData, validateAccessToken } from '@/twitch';
import { useEffect } from 'react';
import { LoadingIndicator, useUpdate } from 'react-admin';

function TwitchCallbackPage() {
  const [update, { isPending, isIdle, isError }] = useUpdate();

  const csrfToken = getCsrfToken();
  const result = parseReturnedData(csrfToken, window.location);

  const accessToken = result.status === 'success' ? result.accessToken : null;

  useEffect(() => {
    const abortController = new AbortController();

    if (accessToken) {
      validateAccessToken(accessToken, { signal: abortController.signal })
        .then((info) => {
          console.log(info);
          update('profile', {
            id: 'my-profile',
            data: { twitch: { accessToken, broadcasterId: info.user_id } },
          });
        })
        .catch(() => {
          update('profile', {
            id: 'my-profile',
            data: { twitch: { accessToken: null } },
          });
        });
    }

    return () => {
      abortController.abort();
    };
  }, [accessToken, update]);

  if (isPending || isIdle) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <div>
        <h1>Error</h1>
        <p>There was an error saving the access token</p>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div>
        <h1>Error</h1>
        <p>{result.error}</p>
        <p>{result.errorDescription}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Success</h1>
    </div>
  );
}

export default TwitchCallbackPage;
