import type { Episode, Stream } from '@/types';
import type { CutList } from '@saebyn/glowing-telegram-types';
import { describe, expect, it } from 'vitest';
import exportEpisodeToCutList from './convertEpisodeToCutList';

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
        { uri: '/bucket/clip1.mp4', duration: 60 * 20 },
        { uri: '/bucket/clip2.mp4', duration: 60 * 20 },
        { uri: '/bucket/clip3.mp4', duration: 60 * 20 },
      ],
    };

    const frameRate = 60;
    const cutList: CutList = exportEpisodeToCutList(episode, stream, frameRate);

    expect(cutList).toMatchObject({
      inputMedia: [
        {
          s3Location: '/bucket/clip1.mp4',
          sections: [
            { startFrame: 5 * 60 * frameRate, endFrame: 20 * 60 * frameRate },
          ],
        },
        {
          s3Location: '/bucket/clip2.mp4',
          sections: [{ startFrame: 0, endFrame: 20 * 60 * frameRate }],
        },
        {
          s3Location: '/bucket/clip3.mp4',
          sections: [
            { startFrame: 0, endFrame: 19 * 60 * frameRate + 30 * frameRate },
          ],
        },
        {
          s3Location: '/assets/outro.mp4',
          sections: [{ startFrame: 0, endFrame: 1800 }],
        },
        {
          s3Location: '/assets/intro.mp4',
          sections: [{ startFrame: 0, endFrame: 3600 }],
        },
        {
          s3Location: '/assets/twitch-watermark.mp4',
          sections: [{ startFrame: 0, endFrame: 114 }],
        },
        {
          s3Location: '/assets/like-sub.mp4',
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
});
