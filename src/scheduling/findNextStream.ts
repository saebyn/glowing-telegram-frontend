import type { Series } from 'glowing-telegram-types/src/types';
import type { DateTime } from 'luxon';
import type { StreamEvent } from './types';

import generateEventsForDay from './generateEventsForDay';

/**
 * Find the next stream event after a given date and time.
 *
 * @param startDateTime The date and time to start searching from
 * @param daysToSearch  The number of days to search for the next stream event
 * @param plans         The stream plans data
 * @returns             The next stream event after the given date and time or
 *                      null if there are no more stream events
 */
function findNextStream(
  startDateTime: DateTime,
  daysToSearch: number,
  plans: Series[],
): StreamEvent | null {
  // first check for the current day from the start time
  const currentDayEvents = generateEventsForDay(startDateTime, plans).filter(
    (event) => event.endDatetime > startDateTime,
  );

  if (currentDayEvents.length > 0) {
    return currentDayEvents[0];
  }

  // then check for every day after the current day
  let nextDay = startDateTime.plus({ days: 1 }).startOf('day');
  for (let i = 0; i < daysToSearch - 1; i++) {
    const events = generateEventsForDay(nextDay, plans);

    if (events.length > 0) {
      return events[0];
    }

    nextDay = nextDay.plus({ days: 1 });
  }

  return null;
}

export default findNextStream;
