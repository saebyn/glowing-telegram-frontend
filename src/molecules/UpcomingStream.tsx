import type { StreamEvent } from '@/scheduling/types';
import type { Profile } from '@/useProfile';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

const upcomingStreamTimeStyle = {
  time: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
};

interface UpcomingStreamProps {
  stream: StreamEvent;
  profile: Profile;
}

function UpcomingStream({ stream, profile }: UpcomingStreamProps) {
  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const date = DateTime.fromISO(stream.date);
  const diff = date
    .diff(now, ['days', 'hours', 'minutes', 'seconds'])
    .toHuman({
      unitDisplay: 'narrow',
      maximumFractionDigits: 0,
    })
    .split(', ');

  const tags = Array.from(
    new Set([...stream.tags, ...profile.standardTags]),
  ).sort();

  return (
    <Paper>
      <Typography variant="subtitle1" gutterBottom>
        Upcoming stream
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">{stream.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Date: {stream.date}
          </Typography>
          <Typography color="textSecondary" sx={upcomingStreamTimeStyle.time}>
            in
            <Typography variant="h6" component="span" color="textPrimary">
              {diff[0]}
            </Typography>
            <Typography variant="h6" component="span" color="textPrimary">
              {diff[1]}
            </Typography>
            <Typography variant="h6" component="span" color="textPrimary">
              {diff[2]}
            </Typography>
            <Typography variant="h6" component="span" color="textPrimary">
              {diff[3]}
            </Typography>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Time: {stream.time}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Category: {stream.category}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Tags: {tags.join(', ')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            {stream.prep_notes ? (
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              <div dangerouslySetInnerHTML={{ __html: stream.prep_notes }} />
            ) : (
              'No notes available'
            )}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default UpcomingStream;
