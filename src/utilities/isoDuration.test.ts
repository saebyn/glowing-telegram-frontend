import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  parseIntoSeconds,
  toISO8601Duration,
} from './isoDuration';

describe('isoDuration', () => {
  describe('parseISODuration', () => {
    it('should parse a duration string with years, months, days, hours, minutes, and seconds', () => {
      expect(parseIntoSeconds('P1Y2M3DT4H5M6S')).toBe(36561906);
    });

    it('should parse a duration string with years, months, days, hours, and minutes', () => {
      expect(parseIntoSeconds('P1Y2M3DT4H5M')).toBe(36561900);
    });

    it('should parse a duration string with hours only', () => {
      expect(parseIntoSeconds('PT4H')).toBe(14400);
    });

    it('should parse a duration string with days only', () => {
      expect(parseIntoSeconds('P3D')).toBe(259200);
    });

    it('should parse a duration string with months only', () => {
      expect(parseIntoSeconds('P2M')).toBe(5184000);
    });

    it('should parse a duration string with years only', () => {
      expect(parseIntoSeconds('P1Y')).toBe(31104000);
    });

    it('should parse a duration string with seconds only', () => {
      expect(parseIntoSeconds('PT6S')).toBe(6);
    });

    it('should parse a duration string with milliseconds', () => {
      expect(parseIntoSeconds('PT6.789S')).toBe(6.789);
    });

    it('should parse a duration string with high precision', () => {
      expect(parseIntoSeconds('PT488.799999S')).toBe(488.799999);
    });

    it('should parse a duration string with high precision with leading zeros', () => {
      expect(parseIntoSeconds('PT12134.0000123S')).toBe(12134.0000123);
    });

    it('should parse a duration string with all components', () => {
      expect(parseIntoSeconds('P1Y2M3DT4H5M6.789S')).toBe(36561906.789);
    });
  });

  // only supports hours, minutes, seconds, and milliseconds
  describe('toISO8601Duration', () => {
    it('should format a duration string with years, months, days, hours, minutes, and seconds', () => {
      expect(
        toISO8601Duration({
          hours: 4,
          minutes: 5,
          seconds: 6,
          milliseconds: 789,
        }),
      ).toBe('PT4H5M6.789S');
    });

    it('should format a duration string with hours only', () => {
      expect(
        toISO8601Duration({
          hours: 4,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        }),
      ).toBe('PT4H');
    });

    it('should format a duration string with 0 seconds', () => {
      expect(
        toISO8601Duration({
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        }),
      ).toBe('PT0S');
    });

    it('should format a duration string with 99 milliseconds', () => {
      expect(
        toISO8601Duration({
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 99,
        }),
      ).toBe('PT0.099S');
    });
  });

  describe('formatDuration', () => {
    it('should format a duration string with days, hours, minutes, and seconds', () => {
      expect(formatDuration(36561906)).toBe('423d 4h 5m 6s');
    });

    it('should format a duration string with hours only', () => {
      expect(formatDuration(14400)).toBe('4h');
    });

    it('should format a duration string with days only', () => {
      expect(formatDuration(259200)).toBe('3d');
    });

    it('should format a 0 duration string', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('should format a duration string with fractional seconds', () => {
      expect(formatDuration(0.5)).toBe('0.5s');
    });
  });
});
