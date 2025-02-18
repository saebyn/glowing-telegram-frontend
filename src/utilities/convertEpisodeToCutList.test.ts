import type { Episode, Stream } from '@/types';
import type { CutList } from '@saebyn/glowing-telegram-types';
import { describe, expect, it } from 'vitest';
import exportEpisodeToCutList, {
  buildCutListFromTracks,
} from './convertEpisodeToCutList';

describe('exportEpisodeToCutList', () => {
  it('should create a cut list for a live stream episode with specific cuts', () => {
    const episode: Episode = {
      title: 'Episode Title',
      description: 'Episode Description',
      id: 'episode-id',
      stream_id: 'stream-id',
      tracks: [
        { start: 'PT5M', end: 'PT20M' },
        { start: 'PT20M', end: 'PT40M' },
        { start: 'PT40M', end: 'PT59M30S' },
      ],
    };

    const stream: Stream = {
      series_id: 'series-id',
      video_clips: [
        { uri: 'bucket/clip1.mp4', duration: 60 * 20 },
        { uri: 'bucket/clip2.mp4', duration: 60 * 20 },
        { uri: 'bucket/clip3.mp4', duration: 60 * 20 },
      ],
    };

    const frameRate = 60;
    const cutList: CutList = exportEpisodeToCutList(episode, stream, frameRate);

    expect(cutList).toMatchObject({
      inputMedia: [
        {
          s3Location: 'bucket/clip1.mp4',
          sections: [
            { startFrame: 5 * 60 * frameRate, endFrame: 20 * 60 * frameRate },
          ],
        },
        {
          s3Location: 'bucket/clip2.mp4',
          sections: [{ startFrame: 0, endFrame: 20 * 60 * frameRate }],
        },
        {
          s3Location: 'bucket/clip3.mp4',
          sections: [
            { startFrame: 0, endFrame: 19 * 60 * frameRate + 30 * frameRate },
          ],
        },
        {
          s3Location: 'my_stock/outro_2.mov',
          sections: [{ startFrame: 0, endFrame: 1800 }],
        },
        {
          s3Location: 'my_stock/introhex.mkv',
          sections: [{ startFrame: 0, endFrame: 3600 }],
        },
        {
          s3Location: 'my_stock/LiveOnTwitch Render 1.mov',
          sections: [{ startFrame: 0, endFrame: 114 }],
        },
        {
          s3Location: 'my_stock/LikeReminder1 Render 1.mov',
          sections: [{ startFrame: 0, endFrame: 300 }],
        },
      ],
      outputTrack: [
        { mediaIndex: 0, sectionIndex: 0 },
        { mediaIndex: 1, sectionIndex: 0 },
        { mediaIndex: 2, sectionIndex: 0 },
        {
          mediaIndex: 3,
          sectionIndex: 0,
          transitionIn: {
            type: 'fade',
            duration: 5 * frameRate,
          },
        },
      ],
      overlayTracks: [
        { mediaIndex: 4, sectionIndex: 0, startFrame: 0 },
        { mediaIndex: 5, sectionIndex: 0, startFrame: frameRate * 30 },
        { mediaIndex: 6, sectionIndex: 0, startFrame: frameRate * 60 },
      ],
      version: '1.0.0',
    });
  });

  it('works with some real data', () => {
    const episodeData = {
      stream_id: '8f94f667-a8fd-4028-a5c7-44a3a4a3c264',
      series_id: '37ae1b65-9751-4b8b-a688-33ef70f4e52b',
      order_index: 165,
      title:
        'backend with python and rust, pulumi and aws | !gt !commands - Episode 165',
      description: '',
      notify_subscribers: true,
      category: 28,
      tags: [
        'GithubCopilot',
        'KeyboardCam',
        'WebDevelopment',
        'rustlang',
        'typescript',
        'vscode',
      ],
      is_published: false,
      tracks: [
        {
          start: 'PT3973.181S', // in minutes and seconds: 66 minutes and 13 seconds
          end: 'PT7315.181S', // in minutes and seconds: 121 minutes and 55 seconds
        },
      ],
      cut_list: {
        inputMedia: [
          {
            s3Location: '2024-12-12/2024-12-12 09-27-54.mkv',
            sections: [
              {
                startFrame: 22139,
                endFrame: 72000,
              },
            ],
          },
          {
            s3Location: '2024-12-12/2024-12-12 09-47-54.mkv',
            sections: [
              {
                startFrame: 0,
                endFrame: 72000,
              },
            ],
          },
          {
            s3Location: '2024-12-12/2024-12-12 10-07-54.mkv',
            sections: [
              {
                startFrame: 0,
                endFrame: 72000,
              },
            ],
          },
          {
            s3Location: '2024-12-12/2024-12-12 10-27-54.mkv',
            sections: [
              {
                startFrame: 0,
                endFrame: 6660,
              },
            ],
          },
          {
            s3Location: 'my_stock/outro_2.mov',
            sections: [
              {
                startFrame: 0,
                endFrame: 1800,
              },
            ],
          },
          {
            s3Location: 'my_stock/introhex.mkv',
            sections: [
              {
                startFrame: 0,
                endFrame: 3600,
              },
            ],
          },
          {
            s3Location: 'my_stock/LiveOnTwitch Render 1.mov',
            sections: [
              {
                startFrame: 0,
                endFrame: 114,
              },
            ],
          },
          {
            s3Location: 'my_stock/LikeReminder1 Render 1.mov',
            sections: [
              {
                startFrame: 0,
                endFrame: 300,
              },
            ],
          },
        ],
        outputTrack: [
          {
            mediaIndex: 0,
            sectionIndex: 0,
          },
          {
            mediaIndex: 1,
            sectionIndex: 0,
          },
          {
            mediaIndex: 2,
            sectionIndex: 0,
          },
          {
            mediaIndex: 3,
            sectionIndex: 0,
          },
          {
            mediaIndex: 4,
            sectionIndex: 0,
            transitionIn: {
              type: 'fade',
              duration: 300,
            },
          },
        ],
        version: '1.0.0',
        overlayTracks: [
          {
            mediaIndex: 5,
            sectionIndex: 0,
            startFrame: 0,
            type: 'alpha',
          },
          {
            mediaIndex: 6,
            sectionIndex: 0,
            startFrame: 1800,
            type: 'colorkey',
          },
          {
            mediaIndex: 7,
            sectionIndex: 0,
            startFrame: 3600,
            type: 'colorkey',
          },
        ],
      },
    };
    const streamData = {
      created_at: '2024-12-13T16:39:54.799190+00:00',
      description: '',
      duration: 10809,
      has_episodes: false,
      id: '8f94f667-a8fd-4028-a5c7-44a3a4a3c264',
      prefix: '2024-12-12',
      series_id: '37ae1b65-9751-4b8b-a688-33ef70f4e52b',
      stream_date: '2024-12-12T16:27:57+00:00',
      stream_id: '45160289499',
      stream_platform: 'twitch',
      thumbnail_url:
        'https://static-cdn.jtvnw.net/cf_vods/d2nvs31859zcd8/cdd0afbad7059fec12b6_saebyn_45160289499_1734020872//thumb/thumb0-%{width}x%{height}.jpg',
      title: 'backend with python and rust, pulumi and aws | !gt !commands',
      updated_at: '2024-12-13T16:40:19.389816+00:00',
      video_clip_count: 10,
      video_clips: [
        {
          uri: '2024-12-12/2024-12-12 08-27-49.mkv',
          duration: 1204.1810302734375,
          start_time: 0,
        },
        {
          uri: '2024-12-12/2024-12-12 08-47-54.mkv',
          duration: 1200, // 20 minutes, + the 1204.1810302734375 seconds from the first clip = 1204.1810302734375 + 1200 = 2404.1810302734375
          start_time: 1204,
        },
        {
          uri: '2024-12-12/2024-12-12 09-07-54.mkv',
          duration: 1200, // 20 minutes, + the 2404.1810302734375 seconds from the first two clips = 2404.1810302734375 + 1200 = 3604.1810302734375
          start_time: 2404,
        },
        {
          uri: '2024-12-12/2024-12-12 09-27-54.mkv',
          duration: 1200, // 20 minutes, + the 3604.1810302734375 seconds from the previous three clips = 3604.1810302734375 + 1200 = 4804.1810302734375
          start_time: 3604,
        },
        {
          uri: '2024-12-12/2024-12-12 09-47-54.mkv',
          duration: 1200,
          start_time: 4804,
        },
        {
          uri: '2024-12-12/2024-12-12 10-07-54.mkv',
          duration: 1200,
          start_time: 6004,
        },
        {
          uri: '2024-12-12/2024-12-12 10-27-54.mkv',
          duration: 1200,
          start_time: 7204,
        },
        {
          uri: '2024-12-12/2024-12-12 10-47-54.mkv',
          duration: 1200,
          start_time: 8404,
        },
        {
          uri: '2024-12-12/2024-12-12 11-07-54.mkv',
          duration: 1200,
          start_time: 9604,
        },
        {
          uri: '2024-12-12/2024-12-12 11-27-54.mkv',
          duration: 4.984000205993652,
          start_time: 10804,
        },
      ],
    };
    const frameRate = 60;
    const cutList: CutList = exportEpisodeToCutList(
      episodeData,
      streamData,
      frameRate,
    );
    expect(cutList).toMatchObject(episodeData.cut_list);
  });
});

describe('buildCutListFromTracks', () => {
  it('should generate a cut list based on input tracks and video clips', () => {
    const videoClips = [
      {
        uri: '2024-12-12/2024-12-12 08-27-49.mkv',
        duration: 1204.1810302734375,
        start_time: 0,
      },
      {
        uri: '2024-12-12/2024-12-12 08-47-54.mkv',
        duration: 1200, // 20 minutes, + the 1204.1810302734375 seconds from the first clip = 1204.1810302734375 + 1200 = 2404.1810302734375
        start_time: 1204,
      },
      {
        uri: '2024-12-12/2024-12-12 09-07-54.mkv',
        duration: 1200, // 20 minutes, + the 2404.1810302734375 seconds from the first two clips = 2404.1810302734375 + 1200 = 3604.1810302734375
        start_time: 2404,
      },
      {
        uri: '2024-12-12/2024-12-12 09-27-54.mkv',
        duration: 1200, // 20 minutes, + the 3604.1810302734375 seconds from the previous three clips = 3604.1810302734375 + 1200 = 4804.1810302734375
        start_time: 3604,
      },
      {
        uri: '2024-12-12/2024-12-12 09-47-54.mkv',
        duration: 1200,
        start_time: 4804,
      },
      {
        uri: '2024-12-12/2024-12-12 10-07-54.mkv',
        duration: 1200,
        start_time: 6004,
      },
      {
        uri: '2024-12-12/2024-12-12 10-27-54.mkv',
        duration: 1200,
        start_time: 7204,
      },
      {
        uri: '2024-12-12/2024-12-12 10-47-54.mkv',
        duration: 1200,
        start_time: 8404,
      },
      {
        uri: '2024-12-12/2024-12-12 11-07-54.mkv',
        duration: 1200,
        start_time: 9604,
      },
      {
        uri: '2024-12-12/2024-12-12 11-27-54.mkv',
        duration: 4.984000205993652,
        start_time: 10804,
      },
    ];
    const episodeTracks = [
      {
        start: 'PT3973.181S', // in minutes and seconds: 66 minutes and 13 seconds
        end: 'PT7315.181S', // in minutes and seconds: 121 minutes and 55 seconds
      },
    ];
    const frameRate = 60;

    const cutList = buildCutListFromTracks(
      episodeTracks,
      videoClips,
      frameRate,
    );

    expect(cutList).toBeDefined();

    expect(cutList).toMatchObject({
      '2024-12-12/2024-12-12 09-27-54.mkv': [
        {
          startFrame: 22139,
          endFrame: 72000,
        },
      ],
      '2024-12-12/2024-12-12 09-47-54.mkv': [
        {
          startFrame: 0,
          endFrame: 72000,
        },
      ],
      '2024-12-12/2024-12-12 10-07-54.mkv': [
        {
          startFrame: 0,
          endFrame: 72000,
        },
      ],
      '2024-12-12/2024-12-12 10-27-54.mkv': [
        {
          startFrame: 0,
          endFrame: 6660,
        },
      ],
    });
  });
});
