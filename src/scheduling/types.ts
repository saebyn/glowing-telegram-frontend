import type { SeriesRecord } from '@/types/dataProvider';
import type { DateTime } from 'luxon';

export interface SeriesRecordWithValidTimes extends SeriesRecord {
  start_time: string;
  end_time: string;
  start_date: string;
  timezone: string;
}

export interface StreamEvent extends SeriesRecord {
  startDatetime: DateTime;
  endDatetime: DateTime;
}
