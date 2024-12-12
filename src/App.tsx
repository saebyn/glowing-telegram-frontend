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

import StreamWidget from '@/pages/StreamWidget';
import { TimerManagerProvider } from '@/timers';
import defaultData from '../defaultData.json';
import authProvider from './authProvider';
import i18nProvider from './i18nProvider';
import ProfilePage from './pages/ProfilePage';
import StreamManagerPage from './pages/StreamManagerPage';
import TwitchCallbackPage from './pages/TwitchCallbackPage';
import Layout from './ra/Layout';

function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);

  useEffect(() => {
    async function startDataProvider() {
      const localForageProvider = await localForageDataProvider({
        defaultData,
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
        <TimerManagerProvider>
          <Admin
            loginPage={false}
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
            authProvider={authProvider}
            layout={Layout}
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
            </CustomRoutes>

            <CustomRoutes noLayout>
              <Route
                path="/twitch-callback"
                element={
                  <Authenticated>
                    <TwitchCallbackPage />
                  </Authenticated>
                }
              />

              <Route
                path="/stream-manager"
                element={
                  <Authenticated>
                    <StreamManagerPage />
                  </Authenticated>
                }
              />

              {/*
               * Stream Widget
               *
               * This route is used to render widgets on the stream overlay.
               * It takes a `widget` and `params` parameter.
               *
               * The `widget` parameter determines which widget to render.
               * The `params` parameter is a base64 encoded JSON string of the widget's props.
               *
               * Example:
               * /widgets/countdown/eyJ0aW1lcklkIjoiMSIsInRleHQiOiJUaW1lciIsInRpdGxlIjoiVGltZXIgZGF0YSJ9
               * would render a CountdownTimerWidget with the following props:
               * {
               *  "timerId": "1",
               * "text": "Timer",
               * "title": "Timer data"
               * }
               */}
              <Route
                path="/widgets/:widget/:params"
                element={<StreamWidget />}
              />
            </CustomRoutes>
          </Admin>
        </TimerManagerProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
