import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.twitch.tv/helix/channels', () => {
    return HttpResponse.json({
      data: [
        {
          broadcaster_id: '28728577',
          broadcaster_login: 'saebyn',
          broadcaster_name: 'saebyn',
          broadcaster_language: 'en',
          game_id: '1469308723',
          game_name: 'Software and Game Development',
          title: 'MSW results are in!',
          delay: 0,
          tags: ['NotARealStreamTag'],
          content_classification_labels: [],
          is_branded_content: false,
        },
      ],
    });
  }),

  http.patch('https://api.twitch.tv/helix/channels', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('https://api.twitch.tv/helix/channels/commercial', () => {
    return HttpResponse.json({
      data: [
        {
          length: 30,
          message: 'Commercial break started.',
          retry_after: 300,
        },
      ],
    });
  }),

  http.post('https://api.twitch.tv/helix/channels/ads/schedule/snooze', () => {
    return HttpResponse.json({
      data: [
        {
          snooze_count: '1',
          snooze_refresh_at: '2023-08-01T23:08:18+00:00',
          next_ad_at: '2023-08-01T23:08:18+00:00',
        },
      ],
    });
  }),
];
