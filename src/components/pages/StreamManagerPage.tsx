import AdManager from '@/components/molecules/AdManager';
import StreamInfoEditor from '@/components/molecules/StreamInfoEditor';
import Timers from '@/components/molecules/Timers';
import UpcomingStream from '@/components/molecules/UpcomingStream';
import useProfile from '@/hooks/useProfile';
import findNextStream from '@/scheduling/findNextStream';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Series } from 'glowing-telegram-types/src/types';
import { DateTime } from 'luxon';
import { LoadingIndicator, useGetList } from 'react-admin';
import { useNavigate } from 'react-router-dom';

const streamManagerStyles = {
  root: {
    padding: 4,
  },
};

function StreamManagerPage() {
  const navigate = useNavigate();

  // get the stream plans records
  const {
    data: streamPlans,
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

  if (streamPlanIsLoading || profileIsLoading) {
    return <LoadingIndicator />;
  }

  if (streamPlanIsError) {
    return <Alert severity="error">{streamPlanError.message}</Alert>;
  }

  if (profileError) {
    return <Alert severity="error">{profileError.message}</Alert>;
  }

  if (!streamPlans || !profile) {
    return <Alert severity="warning">Missing data</Alert>;
  }

  const nextScheduledStream = findNextStream(DateTime.now(), 14, streamPlans);

  return (
    <Paper sx={streamManagerStyles.root}>
      <Typography variant="h5" gutterBottom>
        Stream Manager
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={2} border={1} padding={2}>
          <UpcomingStream
            nextScheduledStream={nextScheduledStream}
            profile={profile}
          />
        </Grid>

        <Grid item xs={3} border={1} padding={2}>
          <StreamInfoEditor
            nextScheduledStream={nextScheduledStream}
            profile={profile}
          />
        </Grid>

        <Grid item xs={3} border={1} padding={2}>
          <AdManager profile={profile} />
        </Grid>

        <Grid item xs={3} border={1} padding={2}>
          <Timers />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default StreamManagerPage;
