import AdManager from '@/molecules/AdManager';
import StreamInfoEditor from '@/molecules/StreamInfoEditor';
import Timers from '@/molecules/Timers';
import UpcomingStream from '@/molecules/UpcomingStream';
import findNextStream from '@/scheduling/findNextStream';
import useProfile from '@/useProfile';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { LoadingIndicator, useGetList } from 'react-admin';

const streamManagerStyles = {
  root: {
    padding: 4,
  },
};

function StreamManagerPage() {
  // get the stream plans records
  const {
    data: streamPlans,
    error: streamPlanError,
    isLoading: streamPlanIsLoading,
    isError: streamPlanIsError,
  } = useGetList('stream_plans', {});

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
        <Button href="/">Return to Dashboard</Button>
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
