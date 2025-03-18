import { Admin, Authenticated, CustomRoutes, Resource } from 'react-admin';

import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom';

import episodes from '@/resources/episodes';
import streamPlans, { StreamPlansCalendar } from '@/resources/stream_plans';
import streams, { StreamVideoEditor } from '@/resources/streams';
import twitch from '@/resources/twitch';
import video_clips from '@/resources/video_clips';

import GlobalStyles from '@mui/material/GlobalStyles';

import OAuthCallbackPage from '@/components/pages/OAuthCallbackPage';
import ProfilePage from '@/components/pages/ProfilePage';
import StreamManagerPage from '@/components/pages/StreamManagerPage';
import StreamWidget from '@/components/pages/StreamWidget';
import { TimerManagerProvider } from '@/hooks/useTimers';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import Layout from '@/ra/Layout';
import authProvider from '@/ra/authProvider';
import dataProvider from '@/ra/dataProvider';
import i18nProvider from '@/ra/i18nProvider';
import { darkTheme, lightTheme } from '@/ra/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { QueryClient } from '@tanstack/react-query';

const {
  VITE_WEBSOCKET_URL: WEBSOCKET_URL,
  VITE_QUERY_STALE_TIME: QUERY_STALE_TIME = 30 * 1000, // 30 seconds
} = import.meta.env;

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME,
      },
    },
  });

  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <AppProviders>
          <Admin
            loginPage={false}
            dataProvider={dataProvider}
            queryClient={queryClient}
            i18nProvider={i18nProvider}
            authProvider={authProvider}
            layout={Layout}
            theme={lightTheme}
            darkTheme={darkTheme}
          >
            <GlobalStyles
              styles={{
                '@keyframes mui-auto-fill': { from: { display: 'block' } },
                '@keyframes mui-auto-fill-cancel': {
                  from: { display: 'block' },
                },
              }}
            />
            <Resource name="series" {...streamPlans}>
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
            <Resource name="streams" {...streams} />
            <Resource name="episodes" {...episodes} />
            <Resource name="video_clips" {...video_clips} />
            <Resource
              name="twitch"
              {...twitch}
              options={{ label: 'Twitch Streams' }}
            />
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
                path="/:provider/callback"
                element={
                  <Authenticated>
                    <OAuthCallbackPage />
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

              <Route
                path="/streams/:id/editor"
                element={
                  <Authenticated>
                    <StreamVideoEditor />
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
        </AppProviders>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <WebsocketProvider url={WEBSOCKET_URL}>
        <TimerManagerProvider>{children}</TimerManagerProvider>
      </WebsocketProvider>
    </LocalizationProvider>
  );
}

export default App;
