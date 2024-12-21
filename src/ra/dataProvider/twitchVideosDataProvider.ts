import type { DataProvider, GetListParams } from 'react-admin';

const { VITE_API_URL: baseApiUrl } = import.meta.env;

const twitchVideosDataProvider = {
  cursorPage: 1,
  cursor: '',

  async getList(
    this: { cursorPage: number; cursor: string },
    _resource: string,
    params: GetListParams,
  ) {
    const page = params.pagination?.page || 1;
    let cursor = '';

    if (page === this.cursorPage) {
      cursor = this.cursor;
    }

    const url = new URL('twitch/videos', baseApiUrl);
    url.searchParams.append('after', cursor);

    const res = await fetch(url);
    const result = await res.json();

    if (page === this.cursorPage && result.pagination?.cursor) {
      this.cursor = result.pagination?.cursor;
      this.cursorPage = page + 1;
    }

    return {
      data: result.data,
      pageInfo: {
        hasNextPage: result.pagination?.cursor,
        hasPreviousPage: false,
      },
    };
  },
} as unknown as DataProvider;

export default twitchVideosDataProvider;
