import GlobalStyles from '@mui/material/GlobalStyles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { QueryClient } from '@tanstack/react-query';
import { Admin, Authenticated, CustomRoutes, Resource } from 'react-admin';
import { createBrowserRouter, Route, RouterProvider } from 'react-router-dom';
import OAuthCallbackPage from '@/components/pages/OAuthCallbackPage';
import ProfilePage from '@/components/pages/ProfilePage';
import StreamManagerPage from '@/components/pages/StreamManagerPage';
import StreamWidget from '@/components/pages/StreamWidget';
import { TimerManagerProvider } from '@/hooks/useTimers';
import authProvider from '@/ra/authProvider';
import dataProvider from '@/ra/dataProvider';
import i18nProvider from '@/ra/i18nProvider';
import Layout from '@/ra/Layout';
import store from '@/ra/store';
import { darkTheme, lightTheme } from '@/ra/theme';
import episodes from '@/resources/episodes';
import projects from '@/resources/projects';
import streamPlans, { StreamPlansCalendar } from '@/resources/stream_plans';
import stream_widgets from '@/resources/stream_widgets';
import streams, { StreamVideoEditor } from '@/resources/streams';
import twitch from '@/resources/twitch';
import video_clips from '@/resources/video_clips';

const {
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
            store={store}
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
            <Resource name="projects" {...projects} />
            <Resource name="video_clips" {...video_clips} />
            <Resource
              name="stream_widgets"
              {...stream_widgets}
              options={{ label: 'Stream Widgets' }}
            />
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
               *
               * New pattern (preferred):
               * /widgets/:widgetId?token=xxx
               * The widgetId is the unique identifier of the widget instance.
               * The token parameter (optional) is used for OBS authentication.
               *
               * Old pattern (backwards compatibility):
               * /widgets/:widget/:params
               * The `widget` parameter determines which widget to render.
               * The `params` parameter is a base64 encoded JSON string of the widget's props.
               */}
              <Route path="/widgets/:widgetId" element={<StreamWidget />} />
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
      <TimerManagerProvider>{children}</TimerManagerProvider>
    </LocalizationProvider>
  );
}

export default App;
