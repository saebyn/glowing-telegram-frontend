import type {
  CutList,
  Episode,
  VideoClip,
} from '@saebyn/glowing-telegram-types';
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

    const videoClips: VideoClip[] = [
      {
        key: 'bucket/clip1.mp4',
        metadata: { format: { duration: 60 * 20 } },
      },
      {
        key: 'bucket/clip2.mp4',
        metadata: { format: { duration: 60 * 20 } },
      },
      {
        key: 'bucket/clip3.mp4',
        metadata: { format: { duration: 60 * 20 } },
      },
    ];

    const frameRate = 60;
    const cutList: CutList = exportEpisodeToCutList(
      episode,
      videoClips,
      frameRate,
    );

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
    const cutList: CutList = {
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
    };
    const episodeData: Episode = {
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
      cut_list: cutList,
    };
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
    ].map(({ uri, duration, start_time }) => ({
      key: uri,
      metadata: { format: { duration } },
      start_time,
    }));
    const frameRate = 60;
    expect(
      exportEpisodeToCutList(episodeData, videoClips, frameRate),
    ).toMatchObject(cutList);
  });
});

describe('buildCutListFromTracks', () => {
  it('should generate a cut list based on input tracks and video clips', () => {
    const videoClips = [
      {
        key: '2024-12-12/2024-12-12 08-27-49.mkv',
        metadata: { format: { duration: 1204.1810302734375 } },
        start_time: 0,
      },
      {
        key: '2024-12-12/2024-12-12 08-47-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 1204,
      },
      {
        key: '2024-12-12/2024-12-12 09-07-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 2404,
      },
      {
        key: '2024-12-12/2024-12-12 09-27-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 3604,
      },
      {
        key: '2024-12-12/2024-12-12 09-47-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 4804,
      },
      {
        key: '2024-12-12/2024-12-12 10-07-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 6004,
      },
      {
        key: '2024-12-12/2024-12-12 10-27-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 7204,
      },
      {
        key: '2024-12-12/2024-12-12 10-47-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 8404,
      },
      {
        key: '2024-12-12/2024-12-12 11-07-54.mkv',
        metadata: { format: { duration: 1200 } },
        start_time: 9604,
      },
      {
        key: '2024-12-12/2024-12-12 11-27-54.mkv',
        metadata: { format: { duration: 4.984000205993652 } },
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
