import { Admin, Authenticated, CustomRoutes, Resource } from 'react-admin';
import { nanoDarkTheme, nanoLightTheme } from 'react-admin';
import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom';

import episodes from '@/resources/episodes';
import streamPlans, { StreamPlansCalendar } from '@/resources/stream_plans';
import streams from '@/resources/streams';
import twitch_streams from '@/resources/twitch_streams';
import video_clips from '@/resources/video_clips';

import GlobalStyles from '@mui/material/GlobalStyles';

import authProvider from '@/authProvider';
import ProfilePage from '@/components/pages/ProfilePage';
import StreamManagerPage from '@/components/pages/StreamManagerPage';
import StreamWidget from '@/components/pages/StreamWidget';
import TwitchCallbackPage from '@/components/pages/TwitchCallbackPage';
import restDataProvider from '@/dataProvider';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import i18nProvider from '@/i18nProvider';
import Layout from '@/ra/Layout';
import { TimerManagerProvider } from '@/timers';
import { deepmerge } from '@mui/utils';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

const themeOverrides = {
  // Disable injecting global styles for MuiInputBase
  components: {
    MuiInputBase: {
      defaultProps: {
        disableInjectingGlobalStyles: true,
      },
    },
  },
};
const lightTheme = deepmerge(nanoLightTheme, themeOverrides);
const darkTheme = deepmerge(nanoDarkTheme, themeOverrides);

function App() {
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <WebsocketProvider url={WEBSOCKET_URL}>
            <TimerManagerProvider>
              <Admin
                loginPage={false}
                dataProvider={restDataProvider}
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
                <Resource name="streams" {...streams} />
                <Resource name="episodes" {...episodes} />
                <Resource name="video_clips" {...video_clips} />
                <Resource name="twitch_streams" {...twitch_streams} />
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
          </WebsocketProvider>
        </LocalizationProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
