import type { RaRecord } from 'react-admin';

const inMemoryListCache = new Map<
  string,
  { items: RaRecord[]; cursor: string | null }
>();

export default inMemoryListCache;
