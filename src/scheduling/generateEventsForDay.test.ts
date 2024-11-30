import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import generateEventsForDay from './generateEventsForDay';
import { type StreamPlan } from './types';

describe('generateEventsForDay', () => {
  it('should return an event for yesterday when the plan is in an earlier timezone', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-04:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-24',
        end_date: '2024-11-24',
        skips: [],
        recurrence: {
          type: 'weekly',
          days: ['sunday'],
          interval: 1,
        },
        timezone: 'America/Los_Angeles',
        start_time: '23:00',
        end_time: '23:30',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      id: '1',
      title: 'Event 1',
      date: '2024-11-25',
      time: '03:00',
      notes: 'Prep notes 1',
    });
  });

  it('should return an event for today when the plan is in the same timezone', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-25',
        end_date: '2024-11-25',
        skips: [],
        recurrence: {
          type: 'weekly',
          days: ['monday'],
          interval: 1,
        },
        timezone: 'America/Los_Angeles',
        start_time: '23:00',
        end_time: '23:30',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      id: '1',
      title: 'Event 1',
      date: '2024-11-25',
      time: '23:00',
      notes: 'Prep notes 1',
    });
  });

  it('should not return an event for today when the plan is in a later timezone', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-26',
        end_date: '2024-11-26',
        skips: [],
        recurrence: {
          type: 'weekly',
          days: ['tuesday'],
          interval: 1,
        },
        timezone: 'America/New_York',
        start_time: '03:00',
        end_time: '23:30',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should not return an event if the target date is skipped', () => {
    const date = DateTime.fromISO('2024-11-28T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        skips: [
          {
            date: '2024-11-28',
            reason: 'Holiday',
          },
        ],
        recurrence: {
          type: 'weekly',
          days: ['thursday'],
          interval: 1,
        },
        timezone: 'America/Los_Angeles',
        start_time: '18:00',
        end_time: '21:00',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should not return an event if the target date is not in the recurrence', () => {
    const date = DateTime.fromISO('2024-11-28T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        skips: [],
        recurrence: {
          type: 'weekly',
          days: ['monday'],
          interval: 1,
        },
        timezone: 'America/Los_Angeles',
        start_time: '18:00',
        end_time: '21:00',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should not return an event if the target date falls on a week that does not match the recurrence interval', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        skips: [],
        recurrence: {
          type: 'weekly',
          days: ['monday'],
          interval: 2,
        },
        timezone: 'America/Los_Angeles',
        start_time: '18:00',
        end_time: '21:00',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should return an event if the target date is in the first week that matches the recurrence interval', () => {
    const date = DateTime.fromISO('2024-11-04T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: StreamPlan[] = [
      {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        prep_notes: 'Prep notes 1',
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        skips: [],
        recurrence: {
          type: 'weekly',
          days: ['monday'],
          interval: 3,
        },
        timezone: 'America/Los_Angeles',
        start_time: '18:00',
        end_time: '21:00',
        tags: ['tag1'],
        category: 'category1',
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      id: '1',
      title: 'Event 1',
      date: '2024-11-04',
      time: '18:00',
      notes: 'Prep notes 1',
    });
  });
});
