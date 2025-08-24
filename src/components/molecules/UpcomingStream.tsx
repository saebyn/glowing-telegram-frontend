import type { Profile } from '@/hooks/useProfile';
import type { StreamEvent } from '@/scheduling/types';
import { templateStreamSeries } from '@/utilities/template';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Series } from '@saebyn/glowing-telegram-types';
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
  nextScheduledStream: StreamEvent | Series | null;
  profile: Profile;
}

function UpcomingStream({ nextScheduledStream, profile }: UpcomingStreamProps) {
  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now());
    }, 1000);

    return () => clearInterval(interval);
  });

  if (!nextScheduledStream) {
    return <Alert severity="info">No upcoming stream in the next 7 days</Alert>;
  }

  const diff =
    'startDatetime' in nextScheduledStream
      ? nextScheduledStream.startDatetime
          .diff(now, ['days', 'hours', 'minutes', 'seconds'])
          .toHuman({
            unitDisplay: 'narrow',
            maximumFractionDigits: 0,
          })
          .split(', ')
      : null;

  const date =
    'startDatetime' in nextScheduledStream
      ? nextScheduledStream.startDatetime.toLocaleString(DateTime.DATE_FULL)
      : null;

  const time =
    'startDatetime' in nextScheduledStream
      ? nextScheduledStream.startDatetime.toLocaleString(DateTime.TIME_SIMPLE)
      : null;

  const tags = Array.from(
    new Set([...(nextScheduledStream.tags || []), ...profile.standardTags]),
  ).sort();

  return (
    <Paper>
      <Typography variant="subtitle1" gutterBottom>
        Upcoming stream
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">
            {templateStreamSeries(nextScheduledStream)}
          </Typography>
        </Grid>
        {date && diff && (
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Date: {date}
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
        )}
        {time && (
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Time: {time}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Category: {nextScheduledStream.twitch_category?.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Tags: {tags.join(', ')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {nextScheduledStream.prep_notes ? (
            <Typography
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{
                __html: nextScheduledStream.prep_notes,
              }}
            />
          ) : (
            <Typography>No notes available</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default UpcomingStream;
