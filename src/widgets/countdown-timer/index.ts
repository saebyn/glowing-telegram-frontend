/**
 * Countdown Timer Widget Registration
 */

import CountdownTimerWidget from '../CountdownTimerWidget';
import type { WidgetDefinition } from '../registry';
import CountdownTimerSkeleton from './CountdownTimerSkeleton';

export const countdownTimerDefinition: WidgetDefinition = {
  type: 'countdown',
  name: 'Countdown Timer',
  description:
    'Display a countdown timer on your stream. Perfect for breaks, giveaways, or timed events.',
  component: CountdownTimerWidget,
  loadingComponent: CountdownTimerSkeleton,
  defaultConfig: {
    timerId: '',
    text: 'Get ready!',
    title: 'Starting Soon',
    duration: 300, // 5 minutes in seconds
  },
  defaultState: {
    duration_left: 300,
    enabled: false,
    last_tick_timestamp: new Date().toISOString(),
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
