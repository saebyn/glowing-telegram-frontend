import { DateTime } from 'luxon';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string;
}

export interface Skip {
  date: string;
  reason: string;
}

export type RecurrenceType = 'weekly';
export type RecurrenceDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

const RECURRENCE_DAYS: Record<number, RecurrenceDay> = {
  7: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export interface Recurrence {
  type: RecurrenceType;
  days: RecurrenceDay[];
  // interval should be a positive integer
  interval: number;
}

export interface StreamPlan {
  id: number;
  name: string;
  description: string;
  prep_notes: string;
  start_date: string;
  end_date: string;
  skips?: Skip[];
  recurrence: Recurrence;
  timezone: string;
  start_time: string;
  end_time: string;
  tags: string[];
  category: string;
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
  plans: StreamPlan[],
): Event[] {
  return (
    plans
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
        if (plan.recurrence.type !== 'weekly') {
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
        const finalDate = datetimeInPlanTimezone.setZone(targetTimezone);

        const eventDate = finalDate.toISODate();
        const eventTime = finalDate.toFormat('HH:mm');

        if (eventDate === null || eventTime === null) {
          throw new Error('Invalid date or time');
        }

        return {
          id: plan.id.toString(),
          title: plan.name,
          date: eventDate,
          time: eventTime,
          notes: plan.prep_notes,
        };
      })
  );
}