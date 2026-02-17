import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import type { WidgetInstance } from '@/types';
import AdTimerSkeleton from './ad-timer/AdTimerSkeleton';

interface AdTimerWidgetProps {
  widgetId: string;
}

type AdTimerStatus =
  | 'invisible'
  | 'ads_incoming'
  | 'ads_in_progress'
  | 'back_from_ads'
  | 'ads_snoozed';

interface AdTimerWidgetConfig extends Record<string, unknown> {
  visibilityThreshold: number; // seconds
  incomingThreshold: number; // seconds
  snoozeDisplayDuration: number; // milliseconds
  backFromAdsDuration: number; // milliseconds
}

interface AdTimerWidgetState extends Record<string, unknown> {
  status: AdTimerStatus;
  secondsUntilAd: number | null;
  nextAdAt: string | null; // ISO timestamp
  snoozeCount: number;
  snoozedAt: string | null; // ISO timestamp when snooze detected
  backFromAdsUntil: string | null; // ISO timestamp until when to show back_from_ads
}

export interface AdTimerWidgetInstance extends WidgetInstance {
  config: AdTimerWidgetConfig;
  state: AdTimerWidgetState;
}

function AdTimerWidget({ widgetId }: AdTimerWidgetProps) {
  const { widget, loading, error } =
    useWidgetSubscription<AdTimerWidgetInstance>(widgetId);

  const [animateChange, setAnimateChange] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [displayStatus, setDisplayStatus] =
    useState<AdTimerStatus>('invisible');
  const [secondsUntilAd, setSecondsUntilAd] = useState<number | null>(null);

  // Update display status based on widget state every second
  useEffect(() => {
    if (!widget) return;

    const updateInterval = setInterval(() => {
      const now = DateTime.now();
      const config = widget.config;
      const state = widget.state;

      // Calculate seconds until ad
      let calculatedSeconds: number | null = null;
      if (state.nextAdAt) {
        const nextAdAt = DateTime.fromISO(state.nextAdAt);
        const diff = nextAdAt.diff(now, 'seconds').seconds;
        calculatedSeconds = Math.max(0, Math.floor(diff));
      }
      setSecondsUntilAd(calculatedSeconds);

      // Determine status
      let newStatus: AdTimerStatus = 'invisible';

      // Check if we should show snoozed message
      if (state.snoozedAt) {
        const snoozedAt = DateTime.fromISO(state.snoozedAt);
        const snoozeElapsed = now.diff(snoozedAt, 'milliseconds').milliseconds;
        if (snoozeElapsed < config.snoozeDisplayDuration) {
          newStatus = 'ads_snoozed';
        }
      }

      // Check if we should show back_from_ads
      if (
        newStatus === 'invisible' &&
        state.backFromAdsUntil &&
        DateTime.fromISO(state.backFromAdsUntil) > now
      ) {
        newStatus = 'back_from_ads';
      }

      // Normal status logic if not showing snooze or back_from_ads
      if (newStatus === 'invisible') {
        if (calculatedSeconds === null) {
          newStatus = 'invisible';
        } else if (calculatedSeconds > config.visibilityThreshold) {
          newStatus = 'invisible';
        } else if (calculatedSeconds <= 0) {
          newStatus = 'ads_in_progress';
        } else if (calculatedSeconds <= config.incomingThreshold) {
          newStatus = 'ads_incoming';
        } else {
          newStatus = 'ads_incoming'; // Within visibility threshold
        }
      }

      // Trigger animation on status change
      if (newStatus !== displayStatus) {
        setDisplayStatus(newStatus);

        // Clear any existing animation timeout
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        setAnimateChange(true);
        animationTimeoutRef.current = setTimeout(() => {
          setAnimateChange(false);
          animationTimeoutRef.current = null;
        }, 300);
      }
    }, 1000);

    return () => {
      clearInterval(updateInterval);
      // Clear animation timeout on unmount
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [widget, displayStatus]);

  if (loading) {
    return <AdTimerSkeleton />;
  }

  if (error || !widget) {
    return null; // Silently hide on error
  }

  if (displayStatus === 'invisible') {
    return null; // Hidden when too far from ad
  }

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine display based on status
  const getStatusDisplay = () => {
    switch (displayStatus) {
      case 'ads_snoozed':
        return {
          text: 'Ads Snoozed',
          color: 'bg-blue-600',
          textColor: 'text-white',
          icon: '😴',
        };
      case 'ads_incoming':
        return {
          text: `Ads in ${formatTime(secondsUntilAd || 0)}`,
          color: 'bg-yellow-600',
          textColor: 'text-white',
          icon: '⚠️',
        };
      case 'ads_in_progress':
        return {
          text: 'Ads in Progress',
          color: 'bg-red-600 animate-pulse',
          textColor: 'text-white',
          icon: '📺',
        };
      case 'back_from_ads':
        return {
          text: 'Back from Ads',
          color: 'bg-green-600',
          textColor: 'text-white',
          icon: '✅',
        };
      default:
        return null;
    }
  };

  const display = getStatusDisplay();

  if (!display) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        animateChange ? 'scale-110' : 'scale-100'
      }`}
    >
      <div
        className={`${display.color} ${display.textColor} px-6 py-3 rounded-lg shadow-lg font-bold text-lg flex items-center gap-2`}
      >
        <span className="text-2xl" aria-hidden="true">
          {display.icon}
        </span>
        <span>{display.text}</span>
      </div>
    </div>
  );
}

export default AdTimerWidget;
