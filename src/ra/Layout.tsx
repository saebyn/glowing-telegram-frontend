import type { FC } from 'react';
import { Layout } from 'react-admin';
import TwitchTokenLivenessChecker from '../atoms/TwitchTokenLivenessChecker';
import AppBar from './AppBar';

const MyLayout: FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Layout appBar={AppBar}>
    {children}

    <TwitchTokenLivenessChecker />
  </Layout>
);

export default MyLayout;
