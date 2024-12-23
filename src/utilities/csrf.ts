const CSRF_TOKEN_KEY = 'gt:csrfToken';

export function getCsrfToken(): string {
  const cachedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!cachedToken) {
    const token = Math.random().toString(36).slice(2);
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    return token;
  }

  return cachedToken;
}
