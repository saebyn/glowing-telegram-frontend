const { VITE_CONTENT_URL } = import.meta.env;
const DEFAULT_CONTENT_URL = 'http://localhost:3000/content/';

if (!VITE_CONTENT_URL) {
  console.warn(
    `VITE_CONTENT_URL environment variable is not set. Defaulting to ${DEFAULT_CONTENT_URL}`,
  );
}

export const CONTENT_URL = VITE_CONTENT_URL || DEFAULT_CONTENT_URL;
