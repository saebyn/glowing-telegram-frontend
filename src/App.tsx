import localForageDataProvider from 'ra-data-local-forage';
import { useEffect, useState } from 'react';
import {
  Admin,
  Authenticated,
  CustomRoutes,
  type DataProvider,
  Resource,
} from 'react-admin';
import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom';

import streamPlans, { StreamPlansCalendar } from './resources/stream_plans';

import defaultData from '../defaultData.json';
import authProvider from './authProvider';
import i18nProvider from './i18nProvider';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import TwitchCallbackPage from './pages/TwitchCallbackPage';
import Layout from './ra/Layout';

function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);

  useEffect(() => {
    async function startDataProvider() {
      const localForageProvider = await localForageDataProvider({
        defaultData,
        loggingEnabled: true,
      });
      setDataProvider(localForageProvider);
    }

    if (dataProvider === null) {
      startDataProvider();
    }
  }, [dataProvider]);

  // hide the admin until the data provider is ready
  if (!dataProvider) return <p>Loading...</p>;

  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <Admin
          dataProvider={dataProvider}
          i18nProvider={i18nProvider}
          authProvider={authProvider}
          layout={Layout}
          loginPage={LoginPage}
        >
          <Resource name="stream_plans" {...streamPlans}>
            <Route path="calendar" element={<StreamPlansCalendar />} />
            <Route
              path="calendar/:targetDate"
              element={<StreamPlansCalendar />}
            />
            <Route
              path="calendar/:targetDate/:view"
              element={<StreamPlansCalendar />}
            />
          </Resource>
          <Resource name="profile" />

          <CustomRoutes>
            <Route
              path="/profile"
              element={
                <Authenticated>
                  <ProfilePage />
                </Authenticated>
              }
            />

            <Route
              path="/twitch-callback"
              element={
                <Authenticated>
                  <TwitchCallbackPage />
                </Authenticated>
              }
            />
          </CustomRoutes>
        </Admin>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
