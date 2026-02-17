import type { Meta, StoryObj } from '@storybook/react';
import AdTimerWidget from './AdTimerWidget';

/**
 * Ad Timer Widget displays countdown for upcoming Twitch ad breaks.
 *
 * **Note**: These stories require a WebSocket connection to display properly.
 * The widget uses `useWidgetSubscription` to receive real-time state updates
 * from the backend. In production, the backend polls Twitch API and pushes
 * state updates via WebSocket.
 *
 * To test this widget:
 * 1. Ensure backend is running with WebSocket support
 * 2. Create an ad_timer widget instance
 * 3. Use the widget ID in the stories below
 *
 * ## Widget States
 *
 * The widget displays different states based on backend-provided data:
 *
 * - **invisible**: Hidden when `secondsUntilAd > visibilityThreshold` or no ad scheduled
 * - **ads_incoming**: Yellow warning when `secondsUntilAd <= incomingThreshold`
 * - **ads_in_progress**: Red pulsing indicator when `secondsUntilAd <= 0`
 * - **back_from_ads**: Green confirmation when `backFromAdsUntil > now`
 * - **ads_snoozed**: Blue message when `snoozedAt` within configured duration
 */
const meta = {
  title: 'Widgets/AdTimerWidget',
  component: AdTimerWidget,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Ad Timer Widget for Twitch ad break countdown. Requires WebSocket connection and backend integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    widgetId: {
      control: 'text',
      description: 'Widget instance ID for WebSocket subscription',
    },
  },
} satisfies Meta<typeof AdTimerWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story - requires a valid widget ID
 *
 * To see the widget in action:
 * 1. Create an ad_timer widget in the admin interface
 * 2. Copy the widget ID
 * 3. Paste it in the widgetId control below
 */
export const Default: Story = {
  args: {
    widgetId: 'your-widget-id-here',
  },
};

/**
 * Example configuration for backend:
 *
 * ```json
 * {
 *   "config": {
 *     "visibilityThreshold": 300,
 *     "incomingThreshold": 120,
 *     "snoozeDisplayDuration": 5000,
 *     "backFromAdsDuration": 10000
 *   },
 *   "state": {
 *     "status": "ads_incoming",
 *     "secondsUntilAd": 180,
 *     "nextAdAt": "2024-02-17T12:30:00.000Z",
 *     "snoozeCount": 2,
 *     "snoozedAt": null,
 *     "backFromAdsUntil": null
 *   }
 * }
 * ```
 */
export const ConfigurationExample: Story = {
  args: {
    widgetId: 'example-widget-id',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story shows the expected backend configuration. The widget will display differently based on the state values provided by the backend.',
      },
    },
  },
};
