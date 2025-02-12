import { type DataProvider, combineDataProviders } from 'react-admin';

import chatDataProvider from './aiChat';
import renderDataProvider from './render';
import resourceMap from './resourceMap';
import restDataProvider from './restDataProvider';
import twitchDataProvider from './twitchDataProvider';

const dataProvider = combineDataProviders((resource) => {
  if (resource === 'aiChat') {
    return chatDataProvider as unknown as DataProvider;
  }

  if (resource === 'render') {
    return renderDataProvider as unknown as DataProvider;
  }

  if (resource in resourceMap) {
    return restDataProvider;
  }

  if (resource === 'twitch') {
    return twitchDataProvider;
  }

  throw new Error(`Unknown resource: ${resource}`);
});

export default dataProvider;
