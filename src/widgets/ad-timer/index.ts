/**
 * Ad Timer Widget Registration
 */

import AdTimerWidget from '../AdTimerWidget';
import type { WidgetDefinition } from '../registry';
import AdTimerSkeleton from './AdTimerSkeleton';

export const adTimerDefinition: WidgetDefinition = {
  type: 'ad_timer',
  name: 'Ad Timer',
  description:
    'Display a timer showing when the next ad break is scheduled. Automatically shows/hides based on proximity to ad break.',
  component: AdTimerWidget,
  loadingComponent: AdTimerSkeleton,
  defaultConfig: {
    visibilityThreshold: 300, // seconds (5 minutes)
    incomingThreshold: 120, // seconds (2 minutes)
  },
  defaultState: {
    status: 'invisible',
    secondsUntilAd: null,
  },
  actions: [],
};
