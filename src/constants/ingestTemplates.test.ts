/**
 * Tests for ingestTemplates utility functions
 */

import type { Stream } from '@saebyn/glowing-telegram-types';
import { describe, expect, it } from 'vitest';
import {
  applyTemplate,
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_SUMMARY_TEMPLATE,
} from './ingestTemplates';

describe('applyTemplate', () => {
  const mockStream: Stream = {
    id: '1',
    title: 'Test Stream',
    stream_date: '2026-02-08T12:00:00Z',
    stream_platform: 'twitch',
    duration: 7200, // 2 hours
    description: 'This is a test stream description',
    prefix: '2026-02-08',
    series_id: '1',
  };

  it('should replace {title} variable with stream title', () => {
    const template = 'Stream: {title}';
    const result = applyTemplate(template, mockStream);
    expect(result).toContain('Test Stream');
  });

  it('should replace {date} variable with formatted date', () => {
    const template = 'Date: {date}';
    const result = applyTemplate(template, mockStream);
    expect(result).toContain('2/8/2026');
  });

  it('should replace {platform} variable with stream platform', () => {
    const template = 'Platform: {platform}';
    const result = applyTemplate(template, mockStream);
    expect(result).toContain('twitch');
  });

  it('should replace {duration} variable with formatted duration', () => {
    const template = 'Duration: {duration}';
    const result = applyTemplate(template, mockStream);
    expect(result).toContain('02 hours, 00 minutes, 00 seconds');
  });

  it('should replace {description} variable with stream description', () => {
    const template = 'Description: {description}';
    const result = applyTemplate(template, mockStream);
    expect(result).toContain('This is a test stream description');
  });

  it('should replace all variables in a complex template', () => {
    const template =
      'Stream {title} on {date} via {platform} lasting {duration}: {description}';
    const result = applyTemplate(template, mockStream);
    expect(result).toContain('Test Stream');
    expect(result).toContain('twitch');
    expect(result).toContain('This is a test stream description');
  });

  it('should handle missing stream_date gracefully', () => {
    const streamWithoutDate: Stream = {
      ...mockStream,
      stream_date: null as unknown as string,
    };
    const result = applyTemplate(DEFAULT_PROMPT_TEMPLATE, streamWithoutDate);
    expect(result).toBe('No stream date available.');
  });

  it('should handle undefined optional fields with empty strings', () => {
    const streamWithUndefinedFields: Stream = {
      ...mockStream,
      title: undefined as unknown as string,
      stream_platform: undefined as unknown as string,
      description: undefined as unknown as string,
    };
    const template = '{title} - {platform} - {description}';
    const result = applyTemplate(template, streamWithUndefinedFields);
    expect(result).toBe(' -  - ');
  });

  it('should handle multiple occurrences of the same variable', () => {
    const template = '{title} and {title} again';
    const result = applyTemplate(template, mockStream);
    expect(result).toBe('Test Stream and Test Stream again');
  });

  it('should work with DEFAULT_PROMPT_TEMPLATE', () => {
    const result = applyTemplate(DEFAULT_PROMPT_TEMPLATE, mockStream);
    expect(result).toContain('Test Stream');
    expect(result).toContain('2/8/2026');
    expect(result).toContain('transcription process');
  });

  it('should work with DEFAULT_SUMMARY_TEMPLATE', () => {
    const result = applyTemplate(DEFAULT_SUMMARY_TEMPLATE, mockStream);
    expect(result).toContain('Test Stream');
    expect(result).toContain('2/8/2026');
    expect(result).toContain('twitch');
    expect(result).toContain('02 hours, 00 minutes, 00 seconds');
    expect(result).toContain('This is a test stream description');
    expect(result).toContain('summarization process');
  });

  it('should handle zero duration', () => {
    const streamWithZeroDuration: Stream = {
      ...mockStream,
      duration: 0,
    };
    const template = 'Duration: {duration}';
    const result = applyTemplate(template, streamWithZeroDuration);
    expect(result).toContain('00 hours, 00 minutes, 00 seconds');
  });

  it('should handle large duration values', () => {
    const streamWithLongDuration: Stream = {
      ...mockStream,
      duration: 86400, // 24 hours
    };
    const template = 'Duration: {duration}';
    const result = applyTemplate(template, streamWithLongDuration);
    expect(result).toContain('24 hours, 00 minutes, 00 seconds');
  });

  it('should handle empty description', () => {
    const streamWithEmptyDescription: Stream = {
      ...mockStream,
      description: '',
    };
    const template = 'Description: {description}';
    const result = applyTemplate(template, streamWithEmptyDescription);
    expect(result).toBe('Description: ');
  });
});
