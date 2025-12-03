import TwitchOAuthButton from '@/components/atoms/TwitchOAuthButton';
import AdManager from '@/components/molecules/AdManager';
import StreamInfoEditor from '@/components/molecules/StreamInfoEditor';
import Timers from '@/components/molecules/Timers';
import UpcomingStream from '@/components/molecules/UpcomingStream';
import useProfile from '@/hooks/useProfile';
import findNextStream from '@/scheduling/findNextStream';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { Series } from '@saebyn/glowing-telegram-types';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { LoadingIndicator, useGetList } from 'react-admin';
import { useNavigate } from 'react-router-dom';

const streamManagerStyles = {
  root: {
    padding: 4,
  },
};

function StreamManagerPage() {
  const navigate = useNavigate();

  const [seriesId, setSeriesId] = useState<string | null>(null);

  // get the stream plans records
  const {
    data: streamSeriesList,
    error: streamPlanError,
    isLoading: streamPlanIsLoading,
    isError: streamPlanIsError,
  } = useGetList<Series>('series', {});

  // get the user profile
  const {
    profile,
    error: profileError,
    isPending: profileIsLoading,
  } = useProfile();

  const seriesMap = useMemo(() => {
    if (!streamSeriesList) {
      return {};
    }

    return streamSeriesList.reduce(
      (acc, series) => {
        acc[series.id] = series;
        return acc;
      },
      {} as Record<string, Series>,
    );
  }, [streamSeriesList]);

  // TODO for all of these loading and error states,
  // we should show a skeleton or something instead of just
  // an alert, and improve the styling

  if (streamPlanIsLoading || profileIsLoading) {
    return <LoadingIndicator />;
  }

  if (streamPlanIsError) {
    return <Alert severity="error">{streamPlanError.message}</Alert>;
  }

  if (profileError) {
    return <Alert severity="error">{profileError.message}</Alert>;
  }

  if (!streamSeriesList || !profile) {
    return <Alert severity="warning">Missing data</Alert>;
  }

  if (profile.twitch?.accessToken === undefined) {
    return (
      <Alert severity="error">
        <TwitchOAuthButton
          tokens={{
            accessToken: undefined,
          }}
        />
        <br />
        You must connect your Twitch account to manage your streams.
      </Alert>
    );
  }

  const nextScheduledStream = findNextStream(
    DateTime.now(),
    14,
    streamSeriesList,
  );

  const selectedStreamPlan =
    seriesId !== null && seriesId in seriesMap
      ? seriesMap[seriesId]
      : nextScheduledStream;

  return (
    <Paper sx={streamManagerStyles.root}>
      <Typography variant="h5" gutterBottom>
        Stream Manager
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3} border={1} padding={2}>
          <UpcomingStream
            nextScheduledStream={selectedStreamPlan}
            profile={profile}
          />
          <FormControl fullWidth>
            <InputLabel id="select-stream-label">Select Stream</InputLabel>
            <Select
              label="or select stream"
              value={seriesId || ''}
              onChange={(event) => setSeriesId(event.target.value as string)}
            >
              <MenuItem value="">Next Scheduled Stream</MenuItem>
              {streamSeriesList.map((streamPlan) => (
                <MenuItem key={streamPlan.id} value={streamPlan.id}>
                  {streamPlan.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} border={1} padding={2}>
          <StreamInfoEditor
            nextScheduledStream={selectedStreamPlan}
            profile={profile}
          />
        </Grid>

        <Grid item xs={2} border={1} padding={2}>
          <AdManager profile={profile} />
        </Grid>

        <Grid item xs={9} border={1} padding={2}>
          <Timers />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default StreamManagerPage;
