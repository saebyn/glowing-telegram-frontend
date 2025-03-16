import {
  fetchAccessToken,
  generateAuthorizeUri,
  uploadEpisodesToYoutube,
} from '@/api';
import type { DataProvider } from 'react-admin';

const dataProvider = {
  async getOne() {
    const accessToken = await fetchAccessToken('youtube');

    return {
      data: accessToken,
    };
  },

  async createMany(_resource: string, params: { data: { id: string }[] }) {
    return uploadEpisodesToYoutube(params.data.map((episode) => episode.id));
  },

  async generateAuthorizeUri(_resource: string, scopes: string[]) {
    return generateAuthorizeUri('youtube', scopes);
  },
} as unknown as DataProvider;

export default dataProvider;
