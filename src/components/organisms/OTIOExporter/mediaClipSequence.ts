import type { VideoClip } from '@saebyn/glowing-telegram-types';
import { FPS } from './constants';
import type { ConvertedCut, InternalTrack } from './types';

interface MediaClipCursor {
  clipIndex: number;
  time: number;
  duration: number;
}

export function findMediaClipCursorStart(
  clips: ConvertedCut[],
  time: number,
): MediaClipCursor | null {
  const clip = clips.find((clip) => {
    return time >= clip.start && time < clip.end;
  });

  if (clip) {
    return {
      clipIndex: clips.indexOf(clip),
      time: time - clip.start,
      duration: Math.min(clip.end - time, clip.end - clip.start),
    };
  }

  return null;
}

export function findMediaClipCursorEnd(
  clips: ConvertedCut[],
  time: number,
): MediaClipCursor | null {
  const clip = clips.find((clip) => {
    const startsAfter = time > clip.start;
    const endsBefore = time <= clip.end;
    const isLastClip = clips.indexOf(clip) === clips.length - 1;
    return startsAfter && (endsBefore || isLastClip);
  });

  if (clip) {
    return {
      clipIndex: clips.indexOf(clip),
      time: 0,
      duration: Math.min(time, clip.end) - clip.start,
    };
  }

  return null;
}

export function findMediaClipCursors(
  clips: ConvertedCut[],
  start: MediaClipCursor,
  end: MediaClipCursor,
): MediaClipCursor[] {
  const cursors = [];

  for (let i = start.clipIndex + 1; i < end.clipIndex; i++) {
    cursors.push({
      clipIndex: i,
      time: 0,
      duration: clips[i].end - clips[i].start,
    });
  }

  return cursors;
}

export function sameMediaClip(a: MediaClipCursor, b: MediaClipCursor): boolean {
  return a.clipIndex === b.clipIndex;
}

export function convertMediaClipCursorToInternalTrack(
  videoClips: VideoClip[],
  cursor: MediaClipCursor,
): InternalTrack {
  const clip = videoClips[cursor.clipIndex];

  const duration = clip.metadata?.format?.duration || 0;

  return {
    sourcePath: clip.key,
    sourceStartFrames: cursor.time * FPS,
    durationFrames: cursor.duration * FPS,
    totalMediaDurationFrames: duration * FPS,
  };
}
