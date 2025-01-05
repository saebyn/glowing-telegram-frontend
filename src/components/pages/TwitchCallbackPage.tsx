import { handleOAuthCallback } from '@/api';
import { useEffect, useState } from 'react';

function TwitchCallbackPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const [loading, setLoading] = useState(true);
  const [finalError, setFinalError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (code && state) {
      console.log('Handling OAuth callback');
      handleOAuthCallback('twitch', code, state)
        .catch((err) => {
          setFinalError(err.message);
          throw err;
        })
        .then((url) => {
          window.location.href = url;
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [code, state, error]);

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{errorDescription}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    );
  }

  if (finalError) {
    return (
      <div>
        <h1>Error</h1>
        <p>{finalError}</p>
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
