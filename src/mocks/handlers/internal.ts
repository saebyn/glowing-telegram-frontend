import { DateTime } from 'luxon';
import { http, HttpResponse } from 'msw';

const profiles = new Map<string, Record<string, unknown>>([
  [
    'my-profile',
    {
      id: 'my-profile',
      name: 'My Profile',
      description: 'This is my profile.',
      timezone: 'America/Los_Angeles',
      twitch: {},
      standardTags: [],
    },
  ],
]);

export const handlers = [
  http.get('/api/timers', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Timer 1',
          duration: 60,
          durationLeft: 30,
          enabled: true,
        },
        {
          id: '2',
          name: 'Timer 2',
          duration: 120,
          durationLeft: 60,
          enabled: false,
        },
        {
          id: '3',
          name: 'Timer 3',
          duration: 180,
          durationLeft: 180,
          enabled: false,
        },
      ],
    });
  }),

  http.get('/api/records/profiles/my-profile', () => {
    return HttpResponse.json(profiles.get('my-profile'));
  }),

  http.put('/api/records/profiles/my-profile', async ({ request }) => {
    const profileUpdate: any = await request.json();

    const profile = {
      ...profiles.get('my-profile'),
      ...profileUpdate,
    };

    profiles.set('my-profile', profile);

    return HttpResponse.json(profiles.get('my-profile'));
  }),

  http.get('/api/records/series', () => {
    return HttpResponse.json({
      items: [
        {
          id: 1,
          title: 'Coding on Sundays',
          description:
            'Coding on Sundays is a weekly stream where we work on a project together.',
          prep_notes: 'Things to think about before I go live.',
          start_date: '2023-01-01',
          end_date: '2024-12-31',
          skips: [
            {
              date: '2024-12-24',
              reason: 'Christmas Eve',
            },
            {
              date: '2024-12-31',
              reason: "New Year's Eve",
            },
          ],
          recurrence: {
            type: 'weekly',
            days: ['sunday'],
            interval: 1,
          },
          timezone: 'America/Los_Angeles',
          start_time: '08:30',
          end_time: '11:30',
          tags: [
            'typescript',
            'react',
            'vscode',
            'GithubCopilot',
            'vite',
            'WebDevelopment',
            'KeyboardCam',
          ],
          twitch_category: {
            id: '1469308723',
            name: 'Software and Game Development',
          },
        },
      ],
      cursor: null,
    });
  }),

  http.get('/api/records/series/1', () => {
    return HttpResponse.json({
      id: 1,
      title: 'Coding on Sundays',
      description:
        'Coding on Sundays is a weekly stream where we work on a project together.',
      prep_notes: 'Things to think about before I go live.',
      start_date: '2023-01-01',
      end_date: '2024-12-31',
      skips: [
        {
          date: '2024-12-24',
          reason: 'Christmas Eve',
        },
        {
          date: '2024-12-31',
          reason: "New Year's Eve",
        },
      ],
      recurrence: {
        type: 'weekly',
        days: ['sunday'],
        interval: 1,
      },
      timezone: 'America/Los_Angeles',
      start_time: '08:30',
      end_time: '11:30',
      tags: [
        'typescript',
        'react',
        'vscode',
        'GithubCopilot',
        'vite',
        'WebDevelopment',
        'KeyboardCam',
      ],
      twitch_category: {
        id: '1469308723',
        name: 'Software and Game Development',
      },
    });
  }),

  http.get('/api/records/streams', () => {
    return HttpResponse.json({
      items: [
        {
          id: 1,
          series_id: 1,
          stream_date: DateTime.now().toISODate(),
          title: 'Coding on Sundays - Week 1',
          video_clip_count: 10,
          has_transcription: true,
          has_silence_detection: true,
          has_episodes: false,
        },
      ],
      cursor: null,
    });
  }),

  http.get('/api/records/episodes', () => {
    return HttpResponse.json({
      items: [
        {
          id: 1,
          stream_id: 1,
          series_id: 1,
          title: 'Coding on Sundays - Week 1, Part 1',
          order_index: 1,
        },
      ],
      cursor: null,
    });
  }),

  http.get('/api/records/video_clips', () => {
    return HttpResponse.json({
      items: [
        {
          id: 1,
          stream_id: 1,
          title: 'Coding on Sundays - Week 1, Clip 1',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
        },
      ],
      cursor: null,
    });
  }),

  http.get('/api/twitch/videos', () => {
    return HttpResponse.json({
      data: [
        {
          id: '12345',
          user_id: '12345',
          user_name: 'twitch_user',
          title: 'Twitch Video Title',
          description: 'Twitch Video Description',
          created_at: DateTime.now().toISO(),
          published_at: DateTime.now().toISO(),
          url: 'https://www.twitch.tv/videos/12345',
          thumbnail_url: 'https://www.twitch.tv/videos/12345/thumb.jpg',
          viewable: 'public',
          view_count: 100,
        },
      ],
    });
  }),
];
