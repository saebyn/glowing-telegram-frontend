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
