import { fetchTwitchAccessToken, generateAuthorizeUri } from '@/api';
import { getVideos } from '@/utilities/twitch';
import type { DataProvider, GetListParams } from 'react-admin';

const twitchDataProvider = {
  cursorPage: 1,
  cursor: '',

  async getOne() {
    const accessToken = await fetchTwitchAccessToken();

    return {
      data: accessToken,
    };
  },

  async generateAuthorizeUri(_resource: string, scopes: string[]) {
    return generateAuthorizeUri('twitch', scopes);
  },

  async getList(
    this: { cursorPage: number; cursor: string },
    _resource: string,
    params: GetListParams,
  ) {
    const accessToken = await fetchTwitchAccessToken();

    if (!accessToken.valid) {
      throw new Error('Invalid Twitch access token');
    }

    const page = params.pagination?.page || 1;
    let cursor = null;

    if (page === this.cursorPage) {
      cursor = this.cursor;
    }

    const result = await getVideos(
      accessToken.id,
      accessToken.accessToken,
      cursor,
    );

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

export default twitchDataProvider;
