import type { Day, Series } from 'glowing-telegram-types/src/types';
import { DateTime } from 'luxon';
import type { SeriesRecordWithValidTimes, StreamEvent } from './types';

export const RECURRENCE_DAYS: Record<number, Day> = {
  7: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function guardValidSeriesRecord(
  record: Series,
): record is SeriesRecordWithValidTimes {
  return (
    typeof record.start_time === 'string' &&
    typeof record.end_time === 'string' &&
    typeof record.start_date === 'string' &&
    typeof record.timezone === 'string'
  );
}

/**
 * Generate events for a given day based on the stream plans data, including
 * recurring events.
 *
 * @param targetDate The date for which to generate events
 * @param plans      The stream plans data
 * @returns          An array of events for the given day
 */
export default function generateEventsForDay(
  targetDate: DateTime,
  plans: Series[],
): StreamEvent[] {
  return (
    plans
      .filter(guardValidSeriesRecord)
      // we are assuming that the recurrence cannot be more than once per day
      // so we can filter the list and only include the events that fall on the
      // given day, rather than having to potentially generate multiple events
      // for the same day
      .filter((plan) => {
        const [startHour, startMinute] = plan.start_time.split(':').map(Number);

        const startDatetime = DateTime.fromISO(plan.start_date, {
          zone: plan.timezone,
        }).set({
          hour: startHour,
          minute: startMinute,
        });

        // reject if the start date of the plan is after the target date
        if (startDatetime > targetDate.endOf('day')) {
          return false;
        }

        if (plan.end_date !== undefined) {
          const [endHour, endMinute] = plan.end_time.split(':').map(Number);
          const endDatetime = DateTime.fromISO(plan.end_date, {
            zone: plan.timezone,
          }).set({
            hour: endHour,
            minute: endMinute,
          });

          // reject if the end date of the plan is before the target date
          if (endDatetime < targetDate.startOf('day')) {
            return false;
          }
        }

        // reject if the plan is skipped on the target date
        if (
          plan.skips?.some((skip) => {
            const skipDate = DateTime.fromISO(skip.date, {
              zone: plan.timezone,
            });

            return skipDate.hasSame(targetDate, 'day');
          })
        ) {
          return false;
        }

        // validate the recurrence type
        if (plan.recurrence?.type !== 'weekly') {
          throw new Error('Unsupported recurrence type');
        }

        // convert `date` to the timezone of the plan
        const targetDateInPlanTimezone = targetDate.setZone(plan.timezone);

        // reject if the plan does not recur on the target day
        if (
          !plan.recurrence.days.includes(
            RECURRENCE_DAYS[targetDateInPlanTimezone.weekday],
          )
        ) {
          return false;
        }

        // reject if the plan does not recur at the correct interval from the
        // start date
        const weeksSinceStart = Math.floor(
          targetDateInPlanTimezone.diff(startDatetime, 'weeks').weeks,
        );
        if (weeksSinceStart % plan.recurrence.interval !== 0) {
          return false;
        }

        return true;
      })
      .map((plan) => {
        const targetTimezone = targetDate.zoneName;

        if (targetTimezone === null) {
          throw new Error('Invalid target timezone');
        }

        // convert `date` to the timezone of the plan
        const dateInPlanTimezone = targetDate.setZone(plan.timezone);

        // set the time to the start time of the plan
        const [hour, minute] = plan.start_time.split(':').map(Number);
        const datetimeInPlanTimezone = dateInPlanTimezone.set({
          hour,
          minute,
        });

        // convert the time to the target timezone
        const startDatetime = datetimeInPlanTimezone.setZone(targetTimezone);

        const [endHour, endMinute] = plan.end_time.split(':').map(Number);
        const endDatetime = dateInPlanTimezone
          .set({
            hour: endHour,
            minute: endMinute,
          })
          .setZone(targetTimezone);

        return {
          ...plan,
          startDatetime,
          endDatetime,
        };
      })
  );
}
