import type { Series } from '@saebyn/glowing-telegram-types';
import type { DateTime } from 'luxon';

export interface SeriesRecordWithValidTimes extends Series {
  start_time: string;
  end_time: string;
  start_date: string;
  timezone: string;
}

export interface StreamEvent extends Series {
  startDatetime: DateTime;
  endDatetime: DateTime;
}
