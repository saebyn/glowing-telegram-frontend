import { parseIntoSeconds } from '@/utilities/isoDuration';
import type {
  CutList,
  Episode,
  Track,
  VideoClip,
} from '@saebyn/glowing-telegram-types';

type TrackTimeRange = {
  start: string;
  end: string;
};

function getVideoClipsForTrack(
  streamVideoClips: VideoClip[],
  frameRate: number,
  { start, end }: TrackTimeRange,
) {
  const cutStartFrame = parseIntoSeconds(start) * frameRate;
  const cutEndFrame = parseIntoSeconds(end) * frameRate;

  // Keep track of the elapsed frames so far, as we iterate through each
  // video clip in the stream
  let elapsedFrames = 0;

  return (
    streamVideoClips
      // convert video clip durations to frames and calculate start and end
      // frames for each clip based on the elapsed frames so far
      .map(function mapVideoClipToFrames({ key, metadata }) {
        // start frame is the elapsed frames so far
        const startFrame = elapsedFrames;

        const duration = metadata?.format?.duration || 0;

        const frames = duration * frameRate;

        // move elapsed frames forward by the duration of this video clip
        elapsedFrames += frames;

        return {
          s3Location: key,
          startFrame: Math.floor(startFrame),
          endFrame: Math.ceil(elapsedFrames),
          relativeStartFrame: Math.floor(
            Math.max(0, cutStartFrame - startFrame),
          ),
          relativeEndFrame: Math.ceil(
            Math.min(frames, cutEndFrame - startFrame),
          ),
        };
      })
      // filter out video clips that are not within the time range of the track
      .filter(function isClipWithinTimeRange({ startFrame, endFrame }) {
        if (startFrame >= cutEndFrame) {
          return false;
        }

        if (endFrame <= cutStartFrame) {
          return false;
        }

        return true;
      })
  );
}

export function buildCutListFromTracks(
  episodeTracks: Track[],
  streamVideoClips: VideoClip[],
  frameRate: number,
) {
  return (
    episodeTracks
      // convert start and end times to frames and select video clips
      // that are within the time range of each track
      .flatMap(getVideoClipsForTrack.bind(null, streamVideoClips, frameRate))
      .reduce(
        function groupByS3Location(
          acc,
          {
            s3Location,

            relativeStartFrame,
            relativeEndFrame,
          },
        ) {
          if (!acc[s3Location]) {
            acc[s3Location] = [];
          }

          acc[s3Location].push({
            startFrame: relativeStartFrame,
            endFrame: relativeEndFrame,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            startFrame: number;
            endFrame: number;
          }[]
        >,
      )
  );
}

export default function exportEpisodeToCutList(
  episode: Episode,
  videoClips: VideoClip[],
  frameRate = 60,
): CutList {
  const tracks = episode.tracks || [];

  // For each track, add which video clip to use and the start and end frames
  // if the track spans multiple video clips, add multiple items to
  // `simpleCutList`
  // Skip any video clips that are prior to the start of the track
  // Skip any video clips that are after the end of the track
  // If a video clip is partially used, only use the portion that is needed
  const simpleCutList = buildCutListFromTracks(tracks, videoClips, frameRate);

  const [inputMedia, outputTrack] = Object.entries(simpleCutList).reduce(
    ([inputMedia, outputTrack], [s3Location, sections]) => {
      let mediaIndex = inputMedia.findIndex(
        (media) => media.s3Location === s3Location,
      );
      if (mediaIndex === -1) {
        mediaIndex = inputMedia.push({ s3Location, sections: [] }) - 1;
      }

      const media = inputMedia[mediaIndex];

      for (const { startFrame, endFrame } of sections) {
        media.sections.push({ startFrame, endFrame });
        outputTrack.push({
          mediaIndex,
          sectionIndex: media.sections.length - 1,
        });
      }

      return [inputMedia, outputTrack];
    },
    [[], []] as [CutList['inputMedia'], CutList['outputTrack']],
  );

  // index 1, outro
  const outroIndex =
    inputMedia.push({
      s3Location: 'my_stock/outro_2.mov',
      sections: [{ startFrame: 0, endFrame: 1800 }],
    }) - 1;
  // Add outro to output track
  outputTrack.push({
    mediaIndex: outroIndex,
    sectionIndex: 0,
    transitionIn: {
      type: 'fade',
      duration: 5 * frameRate, // 5 seconds
    },
  });

  // Create overlay tracks
  // hex iris effect
  const hexIrisIndex =
    inputMedia.push({
      s3Location: 'my_stock/introhex.mkv',
      sections: [{ startFrame: 0, endFrame: 60 * frameRate }],
    }) - 1;
  // streamed live on twitch watermark
  const twitchWatermarkIndex =
    inputMedia.push({
      s3Location: 'my_stock/LiveOnTwitch Render 1.mov',
      sections: [{ startFrame: 0, endFrame: 114 }],
    }) - 1;
  // like/sub reminder
  const likeSubIndex =
    inputMedia.push({
      s3Location: 'my_stock/LikeReminder1 Render 1.mov',
      sections: [{ startFrame: 0, endFrame: 300 }],
    }) - 1;

  const overlayTracks: CutList['overlayTracks'] = [
    // hex iris effect
    {
      mediaIndex: hexIrisIndex,
      sectionIndex: 0,
      startFrame: 0,
      type: 'alpha',
    },
    // streamed live on twitch watermark
    {
      mediaIndex: twitchWatermarkIndex,
      sectionIndex: 0,
      startFrame: frameRate * 30, // 30 seconds in
      type: 'colorkey',
    },
    // like/sub reminder
    {
      mediaIndex: likeSubIndex,
      sectionIndex: 0,
      startFrame: frameRate * 60, // 60 seconds in
      type: 'colorkey',
    },
  ];

  return {
    inputMedia,
    outputTrack,
    version: '1.0.0',
    overlayTracks,
  };
}
