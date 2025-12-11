import { combineDataProviders, type DataProvider } from 'react-admin';

import chatDataProvider from './aiChat';
import renderDataProvider from './render';
import resourceMap from './resourceMap';
import restDataProvider from './restDataProvider';
import twitchDataProvider from './twitch';
import youtubeDataProvider from './youtube';

const dataProvider = combineDataProviders((resource) => {
  switch (resource) {
    case 'aiChat':
      return chatDataProvider as unknown as DataProvider;
    case 'render':
      return renderDataProvider as unknown as DataProvider;
    case 'twitch':
      return twitchDataProvider;
    case 'youtube':
      return youtubeDataProvider;
  }

  if (resource in resourceMap) {
    return restDataProvider;
  }

  throw new Error(`Unknown resource: ${resource}`);
});

export default dataProvider;
