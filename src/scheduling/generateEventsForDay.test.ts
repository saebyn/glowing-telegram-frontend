import type { Series } from '@saebyn/glowing-telegram-types/src/types';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import generateEventsForDay from './generateEventsForDay';

describe('generateEventsForDay', () => {
  it('should return an event for yesterday when the plan is in an earlier timezone', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-04:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        description: 'Description 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: '1',
      title: 'Event 1',
      startDatetime: DateTime.fromISO('2024-11-25T03:00:00.000-04:00', {
        setZone: true,
      }),
      endDatetime: DateTime.fromISO('2024-11-25T03:30:00.000-04:00', {
        setZone: true,
      }),
      prep_notes: 'Prep notes 1',
    });
  });

  it('should return an event for today when the plan is in the same timezone', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: '1',
      title: 'Event 1',
      prep_notes: 'Prep notes 1',
    });
    expect(events[0].startDatetime.toJSDate()).toEqual(
      DateTime.fromISO('2024-11-25T23:00:00.000-08:00').toJSDate(),
    );
  });

  it('should not return an event for today when the plan is in a later timezone', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        description: 'Description 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should not return an event if the target date is skipped', () => {
    const date = DateTime.fromISO('2024-11-28T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        description: 'Description 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should not return an event if the target date is not in the recurrence', () => {
    const date = DateTime.fromISO('2024-11-28T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        description: 'Description 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should not return an event if the target date falls on a week that does not match the recurrence interval', () => {
    const date = DateTime.fromISO('2024-11-25T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        description: 'Description 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(0);
  });

  it('should return an event if the target date is in the first week that matches the recurrence interval', () => {
    const date = DateTime.fromISO('2024-11-04T00:00:00.000-08:00', {
      setZone: true,
    });
    const plans: Series[] = [
      {
        id: '1',
        title: 'Event 1',
        created_at: '2024-11-01T00:00:00.000-08:00',
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
        twitch_category: { id: '1', name: 'category1', box_art_url: '' },
      },
    ];

    const events = generateEventsForDay(date, plans);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: '1',
      title: 'Event 1',
      prep_notes: 'Prep notes 1',
    });
    expect(events[0].startDatetime.toJSDate()).toEqual(
      DateTime.fromISO('2024-11-04T18:00:00.000-08:00').toJSDate(),
    );
  });
});
