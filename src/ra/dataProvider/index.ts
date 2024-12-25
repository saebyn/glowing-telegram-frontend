import { type DataProvider, combineDataProviders } from 'react-admin';

import chatDataProvider from './aiChat';
import resourceMap from './resourceMap';
import restDataProvider from './restDataProvider';
import twitchVideosDataProvider from './twitchVideosDataProvider';

const dataProvider = combineDataProviders((resource) => {
  if (resource === 'aiChat') {
    return chatDataProvider as unknown as DataProvider;
  }

  if (resource in resourceMap) {
    return restDataProvider;
  }

  if (resource === 'twitch_streams') {
    return twitchVideosDataProvider;
  }

  throw new Error(`Unknown resource: ${resource}`);
});

export default dataProvider;
