import { useEffect } from 'react';
import { LoadingIndicator, useUpdate } from 'react-admin';
import { getCsrfToken } from '../csrf';
import { parseReturnedData } from '../twitch';

function TwitchCallbackPage() {
  const [update, { isPending }] = useUpdate();

  const csrfToken = getCsrfToken();
  const result = parseReturnedData(csrfToken, window.location);

  useEffect(() => {
    if (result.status === 'success') {
      // save the access token to the data provider
      update('profile', {
        id: 'my-profile',
        data: { twitch: { accessToken: result.accessToken } },
      });
    }
  });

  if (isPending) {
    return <LoadingIndicator />;
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
