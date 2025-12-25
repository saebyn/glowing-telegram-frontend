import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type { Series } from '@saebyn/glowing-telegram-types';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { Loading, useGetList } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import TwitchOAuthButton from '@/components/atoms/TwitchOAuthButton';
import AdManager from '@/components/molecules/AdManager';
import StreamInfoEditor from '@/components/molecules/StreamInfoEditor';
import UpcomingStream from '@/components/molecules/UpcomingStream';
import useProfile from '@/hooks/useProfile';
import findNextStream from '@/scheduling/findNextStream';

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

  if (streamPlanIsLoading || profileIsLoading) {
    return <LoadingSkeleton />;
  }

  if (streamPlanIsError) {
    return (
      <Paper sx={streamManagerStyles.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Failed to load stream series
            </Typography>
            {streamPlanError.message}
          </Alert>
        </Box>
      </Paper>
    );
  }

  if (profileError) {
    return (
      <Paper sx={streamManagerStyles.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Failed to load profile
            </Typography>
            {profileError.message}
          </Alert>
        </Box>
      </Paper>
    );
  }

  if (!streamSeriesList || !profile) {
    return (
      <Paper sx={streamManagerStyles.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Missing data
            </Typography>
            Unable to load required data for the stream manager. Please try
            refreshing the page.
          </Alert>
        </Box>
      </Paper>
    );
  }

  if (profile.twitch?.accessToken === undefined) {
    return (
      <Paper sx={streamManagerStyles.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Alert severity="info" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Twitch Connection Required
            </Typography>
            <Typography component="p">
              You must connect your Twitch account to manage your streams.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TwitchOAuthButton
                tokens={{
                  accessToken: undefined,
                }}
              />
            </Box>
          </Alert>
        </Box>
      </Paper>
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
        <Grid size={2}>
          <iframe
            id="twitch-chat-embed"
            title="Twitch Chat Embed"
            src="https://www.twitch.tv/embed/saebyn/chat?parent=localhost"
            height="100%"
            width="100%"
          ></iframe>
        </Grid>

        <Grid size={3} border={1} padding={2}>
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

        <Grid size={4} border={1} padding={2}>
          <StreamInfoEditor
            nextScheduledStream={selectedStreamPlan}
            profile={profile}
          />
        </Grid>

        <Grid size={2} border={1} padding={2}>
          <AdManager profile={profile} />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default StreamManagerPage;

function LoadingSkeleton() {
  return (
    <Paper sx={streamManagerStyles.root}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rectangular" width="150px" height={36} />
      </Box>
      <Grid container spacing={2}>
        <Grid size={2}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Grid>
        <Grid size={3}>
          <Paper elevation={1} sx={{ p: 2, height: '400px' }}>
            <Skeleton variant="rectangular" width="100%" height="60%" />
            <Skeleton variant="text" width="80%" height={40} sx={{ mt: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Paper>
        </Grid>
        <Grid size={4}>
          <Paper elevation={1} sx={{ p: 2, height: '400px' }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </Paper>
        </Grid>
        <Grid size={2}>
          <Paper elevation={1} sx={{ p: 2, height: '400px' }}>
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="rectangular" width="100%" height={36} />
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
