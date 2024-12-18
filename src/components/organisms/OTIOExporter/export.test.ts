import { expect, describe, it } from "vitest";

import exportOTIO, { generateChildren, OTIOError } from "./export";
import type { InternalTrack, ConvertedEpisode } from "./types";
import type { Stream, Episode } from "../types";

describe("generateChildren", () => {
  it("should generate internal tracks based on convertedepisode and stream data", () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 1",
      description: "This is convertedepisode 1",
      tracks: [
        { start: 0, end: 100 },
        { start: 200, end: 300 },
      ],
    };

    const stream: Stream = {
      video_clips: [
        { uri: "video1.mp4", duration: 100 },
        { uri: "video2.mp4", duration: 100 },
        { uri: "video3.mp4", duration: 100 },
      ],
    };

    const expected: InternalTrack[] = [
      {
        sourcePath: "video1.mp4",
        sourceStartFrames: 0,
        durationFrames: 6000,

        totalMediaDurationFrames: 6000,
      },
      {
        sourcePath: "video3.mp4",
        sourceStartFrames: 0,
        durationFrames: 6000,

        totalMediaDurationFrames: 6000,
      },
    ];

    const result = generateChildren(convertedepisode, stream);

    expect(result).toEqual(expected);
  });

  it("should generate internal tracks when convertedepisode tracks overlap multiple video clips", () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 2",
      description: "This is convertedepisode 2",
      tracks: [
        { start: 0, end: 200 }, // Overlaps video1.mp4 and video2.mp4
        { start: 150, end: 350 }, // Overlaps video2.mp4 and video3.mp4
      ],
    };

    const stream: Stream = {
      video_clips: [
        { uri: "video1.mp4", duration: 100 },
        { uri: "video2.mp4", duration: 200 },
        { uri: "video3.mp4", duration: 100 },
      ],
    };

    const expected: InternalTrack[] = [
      {
        sourcePath: "video1.mp4",
        sourceStartFrames: 0, // 0 seconds into the clip
        durationFrames: 6000, // 100 seconds into the clip
        totalMediaDurationFrames: 6000, // 100 seconds
      },
      {
        sourcePath: "video2.mp4",
        sourceStartFrames: 0, // 0 seconds into the clip
        durationFrames: 6000, // 100 seconds into the clip
        totalMediaDurationFrames: 12000, // 100 seconds
      },
      {
        sourcePath: "video2.mp4",
        sourceStartFrames: 3000, // 50 seconds into the clip
        durationFrames: 9000, // 150 seconds into the clip
        totalMediaDurationFrames: 12000, // 150 seconds
      },
      {
        sourcePath: "video3.mp4",
        sourceStartFrames: 0, // 0 seconds into the clip
        durationFrames: 3000, // 50 seconds into the clip
        totalMediaDurationFrames: 6000, // 50 seconds
      },
    ];

    const result = generateChildren(convertedepisode, stream);

    expect(result).toEqual(expected);
  });

  it("should return an empty array if there are no tracks in the convertedepisode", () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 3",
      description: "This is convertedepisode 3",
      tracks: [],
    };

    const stream: Stream = {
      video_clips: [
        { uri: "video1.mp4", duration: 100 },
        { uri: "video2.mp4", duration: 100 },
        { uri: "video3.mp4", duration: 100 },
      ],
    };

    const result = generateChildren(convertedepisode, stream);

    expect(result).toEqual([]);
  });

  it("should return an empty array if there are no video clips in the stream", () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 4",
      description: "This is convertedepisode 4",
      tracks: [
        { start: 0, end: 100 },
        { start: 200, end: 300 },
      ],
    };

    const stream: Stream = {
      video_clips: [],
    };

    const result = generateChildren(convertedepisode, stream);

    expect(result).toEqual([]);
  });

  it("should return an empty array if there are no video clips and no tracks", () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 5",
      description: "This is convertedepisode 5",
      tracks: [],
    };

    const stream: Stream = {
      video_clips: [],
    };

    const result = generateChildren(convertedepisode, stream);

    expect(result).toEqual([]);
  });

  it("should throw an OTIOError if the convertedepisode has tracks that are not covered by the video clips", () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 6",
      description: "This is convertedepisode 6",
      tracks: [
        { start: 300, end: 400 },
        { start: 500, end: 600 },
      ],
    };

    const stream: Stream = {
      video_clips: [
        { uri: "video1.mp4", duration: 100 },
        { uri: "video2.mp4", duration: 100 },
        { uri: "video3.mp4", duration: 100 },
      ],
    };

    expect(() => generateChildren(convertedepisode, stream)).toThrowError(
      OTIOError,
    );
  });

  it('should work with "real" data', () => {
    const convertedepisode: ConvertedEpisode = {
      title: "ConvertedEpisode 1",
      description: "This is convertedepisode 1",
      tracks: [
        { start: 28280.0 / 60, end: (28280 + 43971) / 60 },
        { start: (28280 + 43971) / 60, end: (28280 + 43971 + 72000) / 60 },
        {
          start: (28280 + 43971 + 72000) / 60,
          end: (28280 + 43971 + 72000 + 72000) / 60,
        },
        {
          start: (28280 + 43971 + 72000 + 72000) / 60,
          end: (28280 + 43971 + 72000 + 72000 + 2742) / 60,
        },
      ],
    };

    const stream: Stream = {
      video_clips: [
        {
          uri: "F:\\Video\\OBS\\2024-01-31 17-54-59.mkv",
          duration: 72251.0 / 60,
        },
        {
          uri: "F:\\Video\\OBS\\2024-01-31 18-15-04.mkv",
          duration: 72000.0 / 60,
        },
        {
          uri: "F:\\Video\\OBS\\2024-01-31 18-35-04.mkv",
          duration: 72000.0 / 60,
        },
        {
          uri: "F:\\Video\\OBS\\2024-01-31 18-55-04.mkv",
          duration: 72000.0 / 60,
        },
      ],
    };

    const result = generateChildren(convertedepisode, stream);

    const expected: InternalTrack[] = [
      {
        totalMediaDurationFrames: 43971.00000000001,
        durationFrames: 43971.00000000001,
        sourcePath: "F:\\Video\\OBS\\2024-01-31 17-54-59.mkv",
        sourceStartFrames: 28280,
      },
      {
        totalMediaDurationFrames: 72000,
        durationFrames: 72000,
        sourcePath: "F:\\Video\\OBS\\2024-01-31 18-15-04.mkv",
        sourceStartFrames: 0,
      },
      {
        totalMediaDurationFrames: 72000,
        durationFrames: 72000,
        sourcePath: "F:\\Video\\OBS\\2024-01-31 18-35-04.mkv",
        sourceStartFrames: 0,
      },
      {
        totalMediaDurationFrames: 2741.999999999989,
        durationFrames: 2741.999999999989,
        sourcePath: "F:\\Video\\OBS\\2024-01-31 18-55-04.mkv",
        sourceStartFrames: 0,
      },
    ];

    expect(result).toMatchObject(expected);
  });
});

describe("exportOTIO", () => {
  it("should generate an OTIO file based on convertedepisode and stream data", () => {
    const episode: Episode = {
      title: "ConvertedEpisode 1",
      description: "This is convertedepisode 1",
      tracks: [
        { start: "PT0S", end: "PT100S" },
        { start: "PT200S", end: "PT300S" },
      ],
    };

    const stream: Stream = {
      video_clips: [
        { uri: "2024-01-31 17-54-59.mkv", duration: 100 },
        { uri: "2024-01-31 18-15-04.mkv", duration: 100 },
        { uri: "2024-01-31 18-35-04.mkv", duration: 100 },
      ],
    };

    // snapshot the result to avoid having to write a complex expected value
    const result = exportOTIO(episode, stream);

    expect(result).toMatchSnapshot();

    // expect the result to be a string
    expect(typeof result).toBe("string");
  });

  it("should generate a matching OTIO file for my sample export from DaVinci Resolve", () => {
    function w(duration: number) {
      return `PT${duration}S`;
    }

    const episode: Episode = {
      title: "Episode 1",
      description: "This is episode 1",
      tracks: [
        { start: w(28280.0 / 60), end: w((28280 + 43971) / 60) },
        {
          start: w((28280 + 43971) / 60),
          end: w((28280 + 43971 + 72000) / 60),
        },
        {
          start: w((28280 + 43971 + 72000) / 60),
          end: w((28280 + 43971 + 72000 + 72000) / 60),
        },
        {
          start: w((28280 + 43971 + 72000 + 72000) / 60),
          end: w((28280 + 43971 + 72000 + 72000 + 2742) / 60),
        },
      ],
    };

    const stream: Stream = {
      video_clips: [
        {
          uri: "F:\\Video\\OBS\\2024-01-31 17-54-59.mkv",
          duration: 72251.0 / 60,
        },
        {
          uri: "F:\\Video\\OBS\\2024-01-31 18-15-04.mkv",
          duration: 72000.0 / 60,
        },
        {
          uri: "F:\\Video\\OBS\\2024-01-31 18-35-04.mkv",
          duration: 72000.0 / 60,
        },
        {
          uri: "F:\\Video\\OBS\\2024-01-31 18-55-04.mkv",
          duration: 72000.0 / 60,
        },
      ],
    };

    const actual = exportOTIO(episode, stream);

    expect(actual).toMatchFileSnapshot("__snapshots__/test1.otio");
  });

  it("should throw an OTIOError if generateChildren returns an empty array", () => {
    const episode: Episode = {
      title: "ConvertedEpisode 1",
      description: "This is convertedepisode 1",
      tracks: [
        { start: "PT0S", end: "PT100S" },
        { start: "PT200S", end: "PT300S" },
      ],
    };

    const stream: Stream = {
      video_clips: [],
    };

    expect(() => exportOTIO(episode, stream)).toThrowError(OTIOError);
  });
});
