import { DateTime, Duration } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import useProfile from '@/hooks/useProfile';
import { type GetAdScheduleResponse, getAdSchedule } from '@/utilities/twitch';
import AdTimerSkeleton from './ad-timer/AdTimerSkeleton';

interface AdTimerWidgetProps {
  widgetId: string;
}

// Configuration constants
const VISIBILITY_THRESHOLD_SECONDS = 300; // 5 minutes - hide when > X seconds away
const SNOOZE_DISPLAY_DURATION_MS = 5000; // Show snooze message for 5 seconds
const INCOMING_THRESHOLD_SECONDS = 120; // 2 minutes - show "incoming" status
const IN_PROGRESS_THRESHOLD_SECONDS = 0; // When next_ad_at is in the past or very soon

type AdTimerStatus =
  | 'invisible'
  | 'ads_incoming'
  | 'ads_in_progress'
  | 'back_from_ads'
  | 'ads_snoozed';

interface AdTimerState {
  status: AdTimerStatus;
  secondsUntilAd: number | null;
  adSchedule: GetAdScheduleResponse | null;
  error: Error | null;
  snoozedAt: DateTime | null;
}

function AdTimerWidget(_props: AdTimerWidgetProps) {
  const profileResult = useProfile();
  const [state, setState] = useState<AdTimerState>({
    status: 'invisible',
    secondsUntilAd: null,
    adSchedule: null,
    error: null,
    snoozedAt: null,
  });
  const previousSnoozeCount = useRef<number | null>(null);
  const [animateChange, setAnimateChange] = useState(false);

  // Fetch ad schedule on mount and periodically
  useEffect(() => {
    if (
      profileResult.status !== 'success' ||
      !profileResult.profile?.twitch?.accessToken ||
      !profileResult.profile?.twitch?.broadcasterId
    ) {
      return;
    }

    const { broadcasterId, accessToken } = profileResult.profile.twitch;
    const abortController = new AbortController();

    const fetchAdSchedule = async () => {
      try {
        const adSchedule = await getAdSchedule(
          broadcasterId,
          accessToken,
          { signal: abortController.signal },
        );

        setState((prev) => {
          // Check if snooze count increased (ad was snoozed)
          const wasSnoozed =
            previousSnoozeCount.current !== null &&
            adSchedule.snooze_count < previousSnoozeCount.current;
          previousSnoozeCount.current = adSchedule.snooze_count;

          return {
            ...prev,
            adSchedule,
            error: null,
            snoozedAt: wasSnoozed ? DateTime.now() : prev.snoozedAt,
          };
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          setState((prev) => ({
            ...prev,
            error: error as Error,
          }));
        }
      }
    };

    fetchAdSchedule();

    const fetchInterval = setInterval(fetchAdSchedule, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      abortController.abort();
      clearInterval(fetchInterval);
    };
  }, [profileResult]);

  // Update status based on ad schedule every second
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.adSchedule) return prev;

        const now = DateTime.now();
        const nextAdAt = prev.adSchedule.next_ad_at;

        // Calculate seconds until ad
        let secondsUntilAd: number | null = null;
        if (nextAdAt) {
          const diff = nextAdAt.diff(now, 'seconds').seconds;
          secondsUntilAd = Math.max(0, Math.floor(diff));
        }

        // Determine status
        let newStatus: AdTimerStatus = prev.status;

        // Check if we should show snoozed message
        const snoozeDisplayEnded =
          prev.snoozedAt &&
          now.diff(prev.snoozedAt, 'milliseconds').milliseconds >
            SNOOZE_DISPLAY_DURATION_MS;

        if (prev.snoozedAt && !snoozeDisplayEnded) {
          newStatus = 'ads_snoozed';
        } else if (secondsUntilAd === null) {
          // No ad scheduled
          newStatus = 'invisible';
        } else if (secondsUntilAd > VISIBILITY_THRESHOLD_SECONDS) {
          // Too far away
          newStatus = 'invisible';
        } else if (secondsUntilAd <= IN_PROGRESS_THRESHOLD_SECONDS) {
          // Ad is happening now or very soon
          newStatus = 'ads_in_progress';
        } else if (secondsUntilAd <= INCOMING_THRESHOLD_SECONDS) {
          // Ad is incoming
          newStatus = 'ads_incoming';
        } else if (
          prev.status === 'ads_in_progress' ||
          prev.status === 'back_from_ads'
        ) {
          // We just came back from ads
          newStatus = 'back_from_ads';
        } else {
          // Default to incoming if we're within visibility threshold
          newStatus = 'ads_incoming';
        }

        // Clear snoozedAt if display period ended
        const newSnoozedAt = snoozeDisplayEnded ? null : prev.snoozedAt;

        // Trigger animation on status change
        if (newStatus !== prev.status) {
          setAnimateChange(true);
          setTimeout(() => setAnimateChange(false), 300);
        }

        return {
          ...prev,
          status: newStatus,
          secondsUntilAd,
          snoozedAt: newSnoozedAt,
        };
      });
    }, 1000);

    return () => clearInterval(updateInterval);
  }, []);

  if (profileResult.status === 'pending') {
    return <AdTimerSkeleton />;
  }

  if (state.error) {
    return null; // Silently hide on error
  }

  if (state.status === 'invisible') {
    return null; // Hidden when too far from ad
  }

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const duration = Duration.fromObject({ seconds });
    const minutes = Math.floor(duration.as('minutes'));
    const secs = Math.floor(duration.as('seconds') % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine display based on status
  const getStatusDisplay = () => {
    switch (state.status) {
      case 'ads_snoozed':
        return {
          text: '😴 Ads Snoozed',
          color: 'bg-blue-600',
          textColor: 'text-white',
          icon: '😴',
        };
      case 'ads_incoming':
        return {
          text: `⚠️ Ads in ${formatTime(state.secondsUntilAd || 0)}`,
          color: 'bg-yellow-600',
          textColor: 'text-white',
          icon: '⚠️',
        };
      case 'ads_in_progress':
        return {
          text: '📺 Ads in Progress',
          color: 'bg-red-600 animate-pulse',
          textColor: 'text-white',
          icon: '📺',
        };
      case 'back_from_ads':
        return {
          text: '✅ Back from Ads',
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
