import type { FC } from 'react';
import { Layout, useGetIdentity } from 'react-admin';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import AppBar from './AppBar';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

const MyLayout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const identity = useGetIdentity();
  const accessToken = identity?.data?.idToken;
  const websocketUrl = new URL(WEBSOCKET_URL);
  websocketUrl.searchParams.set('token', accessToken || '');

  return (
    <WebsocketProvider url={accessToken ? websocketUrl.toString() : null}>
      <Layout appBar={AppBar}>{children}</Layout>
    </WebsocketProvider>
  );
};

export default MyLayout;
