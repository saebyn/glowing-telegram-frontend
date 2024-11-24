import type { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { DateTime, Info } from 'luxon';
import type { ReactNode } from 'react';
import { List, Loading, useI18nProvider, useListContext } from 'react-admin';
import { useParams } from 'react-router-dom';

import generateEventsForDay from '../../generateEventsForDay';
import ListActions from './ListActions';
import streamActionFilters from './filters';

function StreamPlansCalendar() {
  const { targetDate: targetDateRaw, view } = useParams();

  const targetDate = targetDateRaw
    ? DateTime.fromISO(targetDateRaw)
    : DateTime.now();
  const viewMode = view === 'week' ? 'week' : 'month';

  const nextDate =
    viewMode === 'week'
      ? targetDate.plus({ weeks: 1 })
      : targetDate.plus({ months: 1 });
  const nextDateUrl = `/stream_plans/calendar/${nextDate.toISODate()}/${viewMode}`;

  const prevDate =
    viewMode === 'week'
      ? targetDate.minus({ weeks: 1 })
      : targetDate.minus({ months: 1 });
  const prevDateUrl = `/stream_plans/calendar/${prevDate.toISODate()}/${viewMode}`;

  return (
    <List
      actions={
        <ListActions
          view="calendar"
          nextDateUrl={nextDateUrl}
          prevDateUrl={prevDateUrl}
          weekViewUrl={
            viewMode === 'month'
              ? `/stream_plans/calendar/${targetDate.toISODate()}/week`
              : undefined
          }
          monthViewUrl={
            viewMode === 'week'
              ? `/stream_plans/calendar/${targetDate.toISODate()}/month`
              : undefined
          }
        />
      }
      pagination={<div />}
      filters={streamActionFilters}
    >
      <MonthCalendarView targetDate={targetDate} viewMode={viewMode} />
    </List>
  );
}

export default StreamPlansCalendar;

interface MonthCalendarViewProps {
  targetDate: DateTime;
  viewMode: 'month' | 'week';
}

const calendarPaperStyle = {
  margin: 2,
};

const calendarGridHeadingStyle = {
  padding: 2,
};

const calendarGridContainerStyle = {};

const calendarGridDayStyle = {
  backgroundColor: (theme: Theme) => theme.palette.background.default,
  padding: 2,
  position: 'relative',
  paddingTop: '2.2rem',
  minHeight: '10rem',
};

const calendarGridUnselectedDayStyle = {
  ...calendarGridDayStyle,
  backgroundColor: (theme: Theme) => theme.palette.grey[500],
};

const dayNumberStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  position: 'absolute',
  top: 0,
  left: 0,
  height: '2rem',
  width: '2rem',
  backgroundColor: (theme: Theme) => theme.palette.primary.main,
  color: (theme: Theme) => theme.palette.primary.contrastText,
  lineHeight: '2rem',
  borderRight: '1px solid',
  borderBottom: '1px solid',
};

/**
 * Component to render a calendar view for a given month.
 *
 * This component uses the `useListContext` hook to fetch events data and displays them in a calendar format.
 *
 * If the data is still loading, a loading indicator is displayed. If no events are found, a message is shown.
 * Otherwise, the days of the week are displayed as headers, and each day of the month is displayed in a grid format.
 * Events that fall on each day are listed under the corresponding day.
 */
function MonthCalendarView({
  targetDate,
  viewMode,
}: MonthCalendarViewProps): ReactNode {
  const { data, isLoading } = useListContext();
  const { getLocale, translate } = useI18nProvider();

  if (isLoading) {
    return <Loading />;
  }

  if (!data || data.length === 0) {
    return (
      <Typography>
        {translate(
          'resources.stream_plans.notifications.no_events_found_for_period',
          {
            period: viewMode,
            _: `No events found for the selected ${viewMode}`,
          },
        )}
      </Typography>
    );
  }

  const startOfPeriod = targetDate.startOf(viewMode);
  const endOfPeriod = targetDate.endOf(viewMode);
  const daysInPeriod = Math.ceil(endOfPeriod.diff(startOfPeriod, 'days').days);

  // Days of the week to display as headers
  const daysOfWeek_ = Info.weekdays('long', {
    locale: getLocale(),
  });

  // shift the days of the week to start from Sunday
  const daysOfWeek = [daysOfWeek_[6], ...daysOfWeek_.slice(0, 6)];

  // Calculate the weekday of the first day of the month to align the days correctly
  const firstDayOfFirstWeek = startOfPeriod.weekday % 7; // Luxon weekday starts from Monday (1) to Sunday (7)

  const lastDayOfLastWeek = endOfPeriod.weekday % 7; // Luxon weekday starts from Monday (1) to Sunday (7)

  // Generate an array of all days in the current month, including days from the previous month for alignment
  // Each day object contains the date and the events that fall on that day
  const days = [];

  /**
   * The `-firstDayOfWeek` is used to include days from the previous month for alignment purposes.
   * This ensures that the first day of the current month is placed in the correct weekday column.
   */
  const daysFromPreviousMonthInFirstWeek = -firstDayOfFirstWeek;
  const daysFromNextMonthInLastWeek =
    lastDayOfLastWeek === 0 ? 0 : 7 - lastDayOfLastWeek;

  for (
    let i = daysFromPreviousMonthInFirstWeek;
    i < daysInPeriod + daysFromNextMonthInLastWeek - 1;
    i++
  ) {
    const date = startOfPeriod.plus({ days: i });
    const events = generateEventsForDay(date, data);

    days.push({
      date,
      events,
      inMonth: date.hasSame(targetDate, 'month'),
    });
  }

  return (
    <Box sx={calendarPaperStyle}>
      <Grid container spacing={2} columns={7} sx={calendarGridHeadingStyle}>
        <Grid item md={7}>
          <Typography variant="h4" align="center">
            {targetDate.toFormat('LLLL yyyy')}
          </Typography>
        </Grid>
        {daysOfWeek.map((day) => (
          <Grid item md={1} key={day}>
            <Typography variant="h6" align="center">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} columns={7} sx={calendarGridContainerStyle}>
        {/* Display each day of the month */}
        {days.map((day) => (
          <Grid item md={1} key={day.date.toISODate()}>
            <Paper
              elevation={3}
              square={true}
              variant="outlined"
              sx={
                day.inMonth
                  ? calendarGridDayStyle
                  : calendarGridUnselectedDayStyle
              }
            >
              <Typography variant="h6" sx={dayNumberStyle}>
                {day.date.toFormat('dd')}
              </Typography>

              {/* Display events that fall on the current day */}
              {day.events.map((event) => (
                <Typography key={event.id}>
                  <Typography variant="caption">{event.time}</Typography> |{' '}
                  <Typography variant="caption">{event.title}</Typography>
                  <Typography variant="body2">{event.notes}</Typography>
                </Typography>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
