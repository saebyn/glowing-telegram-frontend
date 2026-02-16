import type { FC } from 'react';
import { Layout } from 'react-admin';
import { WEBSOCKET_URL } from '@/environment';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import AppBar from './AppBar';

const MyLayout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <WebsocketProvider url={WEBSOCKET_URL}>
      <Layout appBar={AppBar}>{children}</Layout>
    </WebsocketProvider>
  );
};

export default MyLayout;
