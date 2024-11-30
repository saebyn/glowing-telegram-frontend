import StreamInfoEditor from '@/molecules/StreamInfoEditor';
import UpcomingStream from '@/molecules/UpcomingStream';
import findNextStream from '@/scheduling/findNextStream';
import useProfile from '@/useProfile';
import Alert from '@mui/material/Alert';
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

  const stream = findNextStream(DateTime.now(), 7, streamPlans);

  if (!stream) {
    return <Alert severity="info">No upcoming stream in the next 7 days</Alert>;
  }

  return (
    <Paper sx={streamManagerStyles.root}>
      <Typography variant="h5" gutterBottom>
        Stream Manager
      </Typography>
      <Grid container>
        <Grid item xs={2} border={1} spacing={2} padding={2}>
          <UpcomingStream stream={stream} profile={profile} />
        </Grid>

        <Grid item xs={3} border={1} spacing={2} padding={2}>
          <StreamInfoEditor stream={stream} profile={profile} />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default StreamManagerPage;
