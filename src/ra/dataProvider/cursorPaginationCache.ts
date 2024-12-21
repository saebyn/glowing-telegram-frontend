const cache: Record<string, Record<number, string | null>> = {};

export function getNext(key: string, page: number) {
  return cache[key]?.[page - 1] || null;
}

export function set(key: string, page: number, cursor: string) {
  if (!cache[key]) {
    cache[key] = {};
  }
  cache[key][page] = cursor;
}
