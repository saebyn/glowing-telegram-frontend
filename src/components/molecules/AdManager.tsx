import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import type { Profile } from '@/hooks/useProfile';
import {
  type GetAdScheduleResponse,
  getAdSchedule,
  snoozeNextAd,
  startCommercial,
} from '@/utilities/twitch';

interface AdManagerProps {
  profile: Profile;
}

function AdManager({ profile }: AdManagerProps) {
  const [adSchedule, setAdSchedule] = useState<GetAdScheduleResponse | null>(
    null,
  );
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [commercialLength, setCommercialLength] = useState(180);

  useEffect(() => {
    const abortController = new AbortController();

    if (!profile.twitch?.accessToken || !profile.twitch?.broadcasterId) {
      return;
    }

    getAdSchedule(profile.twitch.broadcasterId, profile.twitch.accessToken, {
      signal: abortController.signal,
    })
      .then((data) => setAdSchedule(data))
      .catch((e) => setError(e));

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
          .then((data) => setAdSchedule(data))
          .catch((e) => setError(e));
      },
      5 * 60 * 1000,
    ); // refresh every 5 minutes

    const timePassageInterval = setInterval(() => {
      setAdSchedule((prev) => {
        if (!prev) {
          return null;
        }

        return {
          ...prev,
          preroll_free_time: prev?.preroll_free_time.minus({ seconds: 1 }),
        };
      });
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

    setIsPending(true);
    try {
      const data = await snoozeNextAd(
        profile.twitch.broadcasterId,
        profile.twitch.accessToken,
      );
      setAdSchedule((prev) => (prev ? { ...prev, ...data } : null));
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsPending(false);
    }
  };

  const handleStartCommercial = async () => {
    if (!profile.twitch?.accessToken || !profile.twitch?.broadcasterId) {
      return;
    }

    setIsPending(true);
    try {
      await startCommercial(
        profile.twitch.broadcasterId,
        profile.twitch.accessToken,
        commercialLength,
      );
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsPending(false);
    }
  };

  if (!adSchedule) {
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
            setCommercialLength(
              Math.max(30, Math.min(180, Number(e.target.value))),
            )
          }
          InputProps={{ inputProps: { min: 30, max: 180 } }}
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
