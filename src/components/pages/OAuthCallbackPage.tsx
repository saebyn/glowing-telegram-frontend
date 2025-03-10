import { handleOAuthCallback } from '@/api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function TwitchCallbackPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const { provider } = useParams<{
    provider: 'twitch' | 'youtube';
  }>();

  const [loading, setLoading] = useState(true);
  const [finalError, setFinalError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setLoading(false);
      return;
    }

    if (!provider) {
      setFinalError('Missing provider');
      setLoading(false);
      return;
    }

    setLoading(true);

    if (code && state) {
      console.log('Handling OAuth callback');
      handleOAuthCallback(provider, code, state)
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
  }, [code, state, error, provider]);

  if (!provider) {
    return (
      <div>
        <h1>Error</h1>
        <p>Missing provider</p>
      </div>
    );
  }

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
