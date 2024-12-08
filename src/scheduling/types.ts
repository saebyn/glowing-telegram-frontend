import type { TwitchCategory } from '@/twitch';
import type { DateTime } from 'luxon';

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

export const RECURRENCE_DAYS: Record<number, RecurrenceDay> = {
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
  category: TwitchCategory;
}

export interface StreamEvent extends StreamPlan {
  startDatetime: DateTime;
  endDatetime: DateTime;
}
