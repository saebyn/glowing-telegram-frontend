import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { MockWebsocketWrapper } from '@/mocks/MockWebsocketWrapper';
import type { CountdownTimerWidgetInstance } from '@/types';
import CountdownTimerWidget from './CountdownTimerWidget';

const queryClient = new QueryClient();

// Helper function to create a complete widget instance for testing
const createMockWidget = (
  overrides: Partial<CountdownTimerWidgetInstance>,
): CountdownTimerWidgetInstance => ({
  id: 'test-widget',
  title: 'Test Countdown Timer',
  user_id: 'test-user',
  type: 'countdown',
  access_token: 'test-token',
  active: true,
  created_at: DateTime.now().toISO(),
  updated_at: DateTime.now().toISO(),
  config: {
    timerId: 'timer-1',
    text: 'Test Text',
    title: 'Test Title',
    duration: 300,
  },
  state: {
    duration_left: 300,
    enabled: true,
    last_tick_timestamp: DateTime.now().toISO(),
  },
  ...overrides,
});

const meta: Meta<typeof CountdownTimerWidget> = {
  title: 'Widgets/CountdownTimerWidget',
  component: CountdownTimerWidget,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CountdownTimerWidget>;

export const Default: Story = {
  render: (args) => (
    <MockWebsocketWrapper
      messages={[
        {
          type: 'WIDGET_INITIAL_STATE',
          widgetId: args.widgetId,
          widget: createMockWidget({
            id: args.widgetId,
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
          }),
        },
      ]}
    >
      <CountdownTimerWidget {...args} />
    </MockWebsocketWrapper>
  ),
  args: {
    widgetId: 'test-countdown-widget',
  },
};

export const NearlyDone: Story = {
  render: (args) => (
    <MockWebsocketWrapper
      messages={[
        {
          type: 'WIDGET_INITIAL_STATE',
          widgetId: args.widgetId,
          widget: createMockWidget({
            id: args.widgetId,
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
          }),
        },
      ]}
    >
      <CountdownTimerWidget {...args} />
    </MockWebsocketWrapper>
  ),
  args: {
    widgetId: 'test-countdown-widget-2',
  },
};

export const Paused: Story = {
  render: (args) => (
    <MockWebsocketWrapper
      messages={[
        {
          type: 'WIDGET_INITIAL_STATE',
          widgetId: args.widgetId,
          widget: createMockWidget({
            id: args.widgetId,
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
          }),
        },
      ]}
    >
      <CountdownTimerWidget {...args} />
    </MockWebsocketWrapper>
  ),
  args: {
    widgetId: 'test-countdown-widget-3',
  },
};

export const WithFixedSize: Story = {
  render: (args) => (
    <MockWebsocketWrapper
      messages={[
        {
          type: 'WIDGET_INITIAL_STATE',
          widgetId: args.widgetId,
          widget: createMockWidget({
            id: args.widgetId,
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
          }),
        },
      ]}
    >
      <CountdownTimerWidget {...args} />
    </MockWebsocketWrapper>
  ),
  args: {
    widgetId: 'test-countdown-widget-fixed',
  },
};
