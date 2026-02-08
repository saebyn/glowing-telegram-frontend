/**
 * Default templates for stream ingestion
 *
 * These templates are used when ingesting stream videos.
 * They can be customized by users in their profile settings.
 *
 * Template variables:
 * - {title} - Stream title
 * - {date} - Stream date (formatted)
 * - {platform} - Stream platform (e.g., Twitch, YouTube)
 * - {duration} - Stream duration (formatted)
 * - {description} - Stream description
 */

import type { Stream } from '@saebyn/glowing-telegram-types';
import { DateTime, Duration } from 'luxon';

// Default templates - used if the user hasn't customized them in their profile
export const DEFAULT_PROMPT_TEMPLATE = `
Welcome to the start of the stream titled "{title}" on {date}. This text will be used as initial context for the transcription process.
`;

export const DEFAULT_SUMMARY_TEMPLATE = `
The stream on {date} was streamed on {platform}.
It has a duration of {duration}. The description is as follows:
{description}

It was titled "{title}".

This information relates to the stream and will be used as initial context for the summarization process, which summarizes the transcription of the stream.
`;

/**
 * Apply template variables to a template string
 *
 * @param template - The template string with variables in {variable} format
 * @param record - The stream record containing the data to substitute
 * @returns The template with variables replaced by actual values
 */
export function applyTemplate(template: string, record: Stream): string {
  if (!record.stream_date) {
    return 'No stream date available.';
  }

  const date = DateTime.fromISO(record.stream_date).toLocaleString();
  const duration = Duration.fromObject({ seconds: record.duration }).toFormat(
    "hh 'hours,' mm 'minutes,' ss 'seconds'",
  );

  return template
    .replace(/{title}/g, record.title || '')
    .replace(/{date}/g, date)
    .replace(/{platform}/g, record.stream_platform || '')
    .replace(/{duration}/g, duration)
    .replace(/{description}/g, record.description || '');
}
