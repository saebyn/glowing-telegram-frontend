import { http, HttpResponse } from 'msw';

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
];
