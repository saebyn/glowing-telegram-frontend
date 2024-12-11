import {
  type GetAdScheduleResponse,
  getAdSchedule,
  snoozeNextAd,
  startCommercial,
} from '@/twitch';
import type { Profile } from '@/useProfile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

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

    getAdSchedule(profile.twitch.broadcasterId, profile.twitch.accessToken, {
      signal: abortController.signal,
    })
      .then((data) => setAdSchedule(data))
      .catch((e) => setError(e));

    return () => abortController.abort();
  }, [profile.twitch.accessToken, profile.twitch.broadcasterId]);

  const handleSnooze = async () => {
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

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!adSchedule) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h6">Ad Manager</Typography>
      <Typography>
        Time until next ad: {adSchedule.next_ad_at?.toRelative() || 'N/A'}
      </Typography>
      <Typography>
        Number of snoozes available: {adSchedule.snooze_count}
      </Typography>
      <Typography>
        Snooze refresh at:{' '}
        {adSchedule.snooze_refresh_at.toLocaleString(DateTime.DATETIME_MED)}
      </Typography>
      <Typography>
        Pre-roll free time remaining: {adSchedule.preroll_free_time} seconds
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
          onChange={(e) => setCommercialLength(Number(e.target.value))}
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
