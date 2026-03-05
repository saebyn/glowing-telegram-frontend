/**
 * Ad Timer Widget Registration
 */

import { lazy } from 'react';
import type { WidgetDefinition } from '../registry';
import AdTimerSkeleton from './AdTimerSkeleton';

const AdTimerWidget = lazy(() => import('@/widgets/AdTimerWidget'));

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
    snoozeDisplayDuration: 5000, // milliseconds (5 seconds)
    backFromAdsDuration: 10000, // milliseconds (10 seconds)
  },
  defaultState: {
    status: 'invisible',
    secondsUntilAd: null,
    nextAdAt: null,
    snoozeCount: 0,
    snoozedAt: null,
    backFromAdsUntil: null,
  },
  actions: [],
};
