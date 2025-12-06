/**
 * Countdown Timer Widget Registration
 */

import CountdownTimerWidget from '../CountdownTimerWidget';
import type { WidgetDefinition } from '../registry';

export const countdownTimerDefinition: WidgetDefinition = {
  type: 'countdown',
  name: 'Countdown Timer',
  description:
    'Display a countdown timer on your stream. Perfect for breaks, giveaways, or timed events.',
  component: CountdownTimerWidget,
  defaultConfig: {
    timerId: '',
    text: 'Get ready!',
    title: 'Starting Soon',
    duration: 300, // 5 minutes in seconds
  },
  defaultState: {
    durationLeft: 300,
    enabled: false,
    lastTickTimestamp: new Date().toISOString(),
  },
  actions: [
    {
      name: 'start',
      label: 'Start Timer',
      icon: 'play_arrow',
    },
    {
      name: 'pause',
      label: 'Pause Timer',
      icon: 'pause',
    },
    {
      name: 'reset',
      label: 'Reset Timer',
      icon: 'refresh',
    },
  ],
};
