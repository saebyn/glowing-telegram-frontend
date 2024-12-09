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
];
