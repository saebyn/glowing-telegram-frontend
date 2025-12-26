import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DateTime, Duration } from 'luxon';
import { useEffect, useReducer } from 'react';
import type { Profile } from '@/hooks/useProfile';
import {
  COMMERCIAL_MAX_LENGTH,
  COMMERCIAL_MIN_LENGTH,
  type GetAdScheduleResponse,
  getAdSchedule,
  snoozeNextAd,
  startCommercial,
} from '@/utilities/twitch';

interface AdManagerProps {
  profile: Profile;
}

type AdManagerState =
  // initial state
  | {
      error: null;
      isPending: false;
      isLoaded: false;
      adSchedule: null;
      commercialLength: number;
    }
  // initial fetch in progress
  | {
      error: null;
      isPending: true;
      isLoaded: false;
      adSchedule: null;
      commercialLength: number;
    }
  // fetch succeeded
  | {
      error: null;
      isPending: false;
      isLoaded: true;
      adSchedule: GetAdScheduleResponse;
      commercialLength: number;
    }
  // initial fetch failed
  | {
      error: Error;
      isPending: false;
      isLoaded: false;
      adSchedule: null;
      commercialLength: number;
    }
  // fetch in progress after previous request
  | {
      error: null;
      isPending: true;
      isLoaded: true;
      adSchedule: GetAdScheduleResponse;
      commercialLength: number;
    }
  // fetch succeeded after previous failure
  | {
      error: Error;
      isPending: false;
      isLoaded: true;
      adSchedule: GetAdScheduleResponse;
      commercialLength: number;
    };

type AdManagerAction =
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: Partial<GetAdScheduleResponse> | null;
    }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_COMMERCIAL_LENGTH'; payload: number }
  | { type: 'TICK' };

function adManagerReducer(
  state: AdManagerState,
  action: AdManagerAction,
): AdManagerState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isPending: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      if (!action.payload) {
        return {
          ...state,
          isPending: false,
          error: null,
        };
      }

      return {
        ...state,
        isPending: false,
        isLoaded: true,
        adSchedule: {
          ...state.adSchedule,
          duration: action.payload.duration || state.adSchedule?.duration || 0,
          next_ad_at:
            action.payload.next_ad_at || state.adSchedule?.next_ad_at || null,
          last_ad_at:
            action.payload.last_ad_at || state.adSchedule?.last_ad_at || null,
          preroll_free_time:
            action.payload.preroll_free_time ||
            state.adSchedule?.preroll_free_time ||
            Duration.fromObject({ seconds: 0 }),
          snooze_count:
            action.payload.snooze_count || state.adSchedule?.snooze_count || 0,
          snooze_refresh_at:
            action.payload.snooze_refresh_at ||
            state.adSchedule?.snooze_refresh_at ||
            null,
        },
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isPending: false,
        error: action.payload,
      };
    case 'SET_COMMERCIAL_LENGTH':
      return {
        ...state,
        commercialLength: Math.max(
          COMMERCIAL_MIN_LENGTH,
          Math.min(COMMERCIAL_MAX_LENGTH, action.payload),
        ),
      };
    case 'TICK':
      if (state.adSchedule) {
        const currentSeconds = state.adSchedule.preroll_free_time.as('seconds');
        return {
          ...state,
          adSchedule: {
            ...state.adSchedule,
            preroll_free_time:
              currentSeconds > 0
                ? state.adSchedule.preroll_free_time.minus({ seconds: 1 })
                : state.adSchedule.preroll_free_time,
          },
        };
      }
      return state;
    default:
      return state;
  }
}

function createInitialAdManagerState(): AdManagerState {
  return {
    error: null,
    isPending: false,
    isLoaded: false,
    adSchedule: null,
    commercialLength: 180,
  };
}

function AdManager({ profile }: AdManagerProps) {
  const [
    { adSchedule, commercialLength, error, isLoaded, isPending },
    dispatch,
  ] = useReducer(adManagerReducer, null, createInitialAdManagerState);

  useEffect(() => {
    const abortController = new AbortController();

    if (!profile.twitch?.accessToken || !profile.twitch?.broadcasterId) {
      return;
    }

    getAdSchedule(profile.twitch.broadcasterId, profile.twitch.accessToken, {
      signal: abortController.signal,
    })
      .then((data) => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch((e) => dispatch({ type: 'FETCH_ERROR', payload: e }));

    const adScheduleFetcherInterval = setInterval(
      () => {
        if (!profile.twitch?.accessToken || !profile.twitch?.broadcasterId) {
          return;
        }

        getAdSchedule(
          profile.twitch.broadcasterId,
          profile.twitch.accessToken,
          { signal: abortController.signal },
        )
          .then((data) => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
          .catch((e) => dispatch({ type: 'FETCH_ERROR', payload: e }));
      },
      5 * 60 * 1000,
    ); // refresh every 5 minutes

    const timePassageInterval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000); // update every second

    abortController.signal.addEventListener('abort', () => {
      clearInterval(adScheduleFetcherInterval);
      clearInterval(timePassageInterval);
    });

    return () => abortController.abort();
  }, [profile.twitch?.accessToken, profile.twitch?.broadcasterId]);

  const handleSnooze = async () => {
    if (!profile.twitch?.accessToken || !profile.twitch?.broadcasterId) {
      return;
    }

    dispatch({ type: 'FETCH_START' });
    try {
      const data = await snoozeNextAd(
        profile.twitch.broadcasterId,
        profile.twitch.accessToken,
      );
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: e as Error });
    }
  };

  const handleStartCommercial = async () => {
    if (!profile.twitch?.accessToken || !profile.twitch?.broadcasterId) {
      return;
    }

    dispatch({ type: 'FETCH_START' });
    try {
      await startCommercial(
        profile.twitch.broadcasterId,
        profile.twitch.accessToken,
        commercialLength,
      );
      dispatch({ type: 'FETCH_SUCCESS', payload: null });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: e as Error });
    }
  };

  if (!isLoaded) {
    return <CircularProgress />;
  }

  const now = DateTime.now();
  const nextAdIn = adSchedule.next_ad_at
    ? adSchedule.next_ad_at.diff(now, ['minutes', 'seconds'])
    : null;

  return (
    <Box>
      <Typography variant="h6">Ad Manager</Typography>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Typography>
        Time until next ad:{' '}
        {nextAdIn?.toHuman({
          maximumFractionDigits: 0,
          listStyle: 'long',
          unitDisplay: 'short',
        }) || 'N/A'}
      </Typography>
      <Typography>
        Number of snoozes available: {adSchedule.snooze_count}
      </Typography>
      <Typography>
        Snooze refresh at:{' '}
        {adSchedule.snooze_refresh_at?.toLocaleString(DateTime.DATETIME_MED) ||
          'N/A'}
      </Typography>
      <Typography>
        Pre-roll free time remaining:{' '}
        {adSchedule.preroll_free_time.rescale().toHuman({
          listStyle: 'long',
          unitDisplay: 'short',
        })}
      </Typography>
      <Button
        variant="contained"
        onClick={handleSnooze}
        disabled={isPending || adSchedule.snooze_count === 0}
      >
        Snooze Next Ad
      </Button>
      <Box mt={2}>
        <TextField
          label="Commercial Length (seconds)"
          type="number"
          value={commercialLength}
          onChange={(e) =>
            dispatch({
              type: 'SET_COMMERCIAL_LENGTH',
              payload: Number(e.target.value),
            })
          }
          InputProps={{
            inputProps: {
              min: COMMERCIAL_MIN_LENGTH,
              max: COMMERCIAL_MAX_LENGTH,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleStartCommercial}
          disabled={isPending}
        >
          Start Commercial
        </Button>
      </Box>
    </Box>
  );
}

export default AdManager;
