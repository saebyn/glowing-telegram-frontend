import type { FC } from 'react';
import { Layout } from 'react-admin';
import AppBar from './AppBar';

const MyLayout: FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Layout appBar={AppBar}>{children}</Layout>
);

export default MyLayout;
