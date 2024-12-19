import { getCsrfToken } from '@/csrf';
import { parseReturnedData, validateAccessToken } from '@/twitch';
import { useEffect } from 'react';
import { LoadingIndicator, useUpdate } from 'react-admin';
import { useNavigate } from 'react-router-dom';

function TwitchCallbackPage() {
  const [update, { isPending, isIdle, isError }] = useUpdate();
  const navigate = useNavigate();

  const csrfToken = getCsrfToken();
  const result = parseReturnedData(csrfToken, window.location);

  const accessToken = result.status === 'success' ? result.accessToken : null;

  useEffect(() => {
    const abortController = new AbortController();

    if (accessToken) {
      validateAccessToken(accessToken, { signal: abortController.signal })
        .then((info) => {
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
        })
        .then(() => {
          navigate('/profile');
        });
    }

    return () => {
      abortController.abort();
    };
  }, [accessToken, update, navigate]);

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
