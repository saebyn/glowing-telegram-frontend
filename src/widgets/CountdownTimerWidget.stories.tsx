import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from 'luxon';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import CountdownTimerWidget from './CountdownTimerWidget';

const meta: Meta<typeof CountdownTimerWidget> = {
  title: 'Widgets/CountdownTimerWidget',
  component: CountdownTimerWidget,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <WebsocketProvider url="ws://localhost:8000/ws" token="test-token">
        <Story />
      </WebsocketProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CountdownTimerWidget>;

// Mock the useWidgetSubscription hook
export const Default: Story = {
  args: {
    widgetId: 'test-countdown-widget',
  },
  parameters: {
    mockData: [
      {
        url: '/widgets/test-countdown-widget',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-countdown-widget',
          type: 'countdown',
          config: {
            timerId: 'timer-1',
            text: 'Get ready for the next segment!',
            title: 'Starting Soon',
            duration: 300,
          },
          state: {
            duration_left: 300,
            enabled: true,
            last_tick_timestamp: DateTime.now().toISO(),
          },
        },
      },
    ],
  },
};

export const NearlyDone: Story = {
  args: {
    widgetId: 'test-countdown-widget-2',
  },
  parameters: {
    mockData: [
      {
        url: '/widgets/test-countdown-widget-2',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-countdown-widget-2',
          type: 'countdown',
          config: {
            timerId: 'timer-2',
            text: 'Almost there!',
            title: 'Coming Back',
            duration: 60,
          },
          state: {
            duration_left: 10,
            enabled: true,
            last_tick_timestamp: DateTime.now().toISO(),
          },
        },
      },
    ],
  },
};

export const Paused: Story = {
  args: {
    widgetId: 'test-countdown-widget-3',
  },
  parameters: {
    mockData: [
      {
        url: '/widgets/test-countdown-widget-3',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-countdown-widget-3',
          type: 'countdown',
          config: {
            timerId: 'timer-3',
            text: 'Break time!',
            title: 'BRB',
            duration: 600,
          },
          state: {
            duration_left: 245,
            enabled: false,
            last_tick_timestamp: DateTime.now().toISO(),
          },
        },
      },
    ],
  },
};

export const WithFixedSize: Story = {
  args: {
    widgetId: 'test-countdown-widget-fixed',
  },
  parameters: {
    mockData: [
      {
        url: '/widgets/test-countdown-widget-fixed',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-countdown-widget-fixed',
          type: 'countdown',
          config: {
            timerId: 'timer-fixed',
            text: 'Fixed size widget for OBS',
            title: 'Consistent Size',
            duration: 600,
            width: 800,
            height: 600,
            showBackground: true,
          },
          state: {
            duration_left: 300,
            enabled: true,
            last_tick_timestamp: DateTime.now().toISO(),
          },
        },
      },
    ],
  },
};
