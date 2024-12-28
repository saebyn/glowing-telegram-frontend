import { useGetManyReference, useGetOne, useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';

import ChatButton from '@/components/molecules/ChatButton';
import type { Episode, Series } from '@/types';
import type { TranscriptSegment, VideoClipRecord } from '@/types/dataProvider';
import { parseIntoSeconds } from '@/utilities/isoDuration';

const EpisodeDescriptionChatButton = () => {
  const { setValue } = useFormContext();
  const record = useRecordContext<Episode>();

  const { data: stream } = useGetOne(
    'streams',
    {
      id: record?.stream_id,
    },
    {
      enabled: !!record?.stream_id,
    },
  );

  const { data: series } = useGetOne<Series>(
    'series',
    {
      id: stream?.series_id,
    },
    {
      enabled: !!stream?.series_id,
    },
  );

  const { data: rawRelatedVideoClips } = useGetManyReference<VideoClipRecord>(
    'video_clips',
    {
      target: 'stream_id',
      id: record?.stream_id,
    },
    {
      enabled: !!record?.stream_id,
    },
  );

  if (!record) {
    return null;
  }

  if (!stream) {
    return null;
  }

  if (!rawRelatedVideoClips) {
    return null;
  }

  const job = `I summarize the provided video transcript into a title and
  description of the video to optimize for finding this video on youtube.
  My response is a well-formed JSON object that includes the title and 
  description. It should look like this:

  {
    "title": "Title of the video",
    "description": "Description of the video content \n\n On as many lines as needed."
  }
  `;

  const context = `
    I need help summarizing the video transcript into a title and description 
    for the video. I would prefer the text to be written in the first person. I 
    would like the title to be a maximum of 100 characters and the description 
    to be a maximum of 5000 characters. I would like the description to be 
    broken up into paragraphs and formatted for readability. The base 
    description is provided below, and the text and links from it should be 
    added to the end of the final description. The title should be a concise 
    summary of the video content. The description should be a detailed summary 
    of the video content. The description should include the main points of the 
    video and any relevant links or resources mentioned in the video. The 
    description should be written in the first person, in a conversational 
    tone, in proper English with complete sentences.  The description should be 
    written in a professional and friendly tone. The description should be 
    written in a clear and concise manner, in a way that is relevant and 
    useful, engaging and educational. The description should not start with
    the general topic of the entire series, but should be specific to the
    content of this particular episode and how it fits into the series. An
    example of a good description start is: "In this video, we discuss the how
    to implement a chatbot using Python."
    An example of a bad description start is: "Welcome to episode 78 of our Chill Sunday Morning Coding series, where we dive into integrating Rust APIs with React-Admin for our Glowing-Telegram project". 
    Another example of a bad description start is: "In this video, we take a deep dive into integrating Rust APIs with React-Admin to ..."

    The tentative title of the video is "${record.title}".
    The stream was recorded on ${stream.stream_date}. My timezone is US Pacific Time.

    The series that this video is a part of has the title "${series?.title}"

    The base description is:
${record.description}


    Here is the transcript:
`;

  const relatedVideoClips = rawRelatedVideoClips.slice().sort((a, b) => {
    if (a.start_time === undefined || b.start_time === undefined) {
      return 0;
    }

    return a.start_time - b.start_time;
  });

  let elapsedTime = 0;

  const transcriptionSegments = relatedVideoClips.flatMap(
    (videoClip: VideoClipRecord): Array<TranscriptSegment> => {
      if (!videoClip.transcription) {
        return [];
      }

      const startOffset = elapsedTime;

      if (videoClip.metadata?.format.duration === undefined) {
        throw new Error('Duration is undefined');
      }

      elapsedTime += videoClip.metadata.format.duration;

      return videoClip.transcription.segments.map((segment) => ({
        ...segment,
        start: segment.start + startOffset,
        end: segment.end + startOffset,
      }));
    },
  );

  if (!transcriptionSegments) {
    return null;
  }

  let episodeStart: null | number = null;

  const transcript = transcriptionSegments
    .filter((segment) => transcriptSegmentOverlaps(segment, record))
    .map((segment: TranscriptSegment) => {
      if (episodeStart === null) {
        episodeStart = segment.start;
      }

      const start = Math.round(segment.start - episodeStart);

      return `${start}s: ${segment.text}`;
    })
    .join('\n');

  const handleChange = (content: string) => {
    const json = JSON.parse(content);

    setValue('title', json.title);
    setValue('description', json.description);
  };

  return (
    <ChatButton
      job={job}
      transcript={transcript}
      context={context}
      onChange={handleChange}
    />
  );
};

function transcriptSegmentOverlaps(
  segment: TranscriptSegment,
  record: Episode,
): boolean {
  if (!record.tracks || record.tracks.length === 0) {
    return false;
  }

  const startTranscript = segment.start;
  const endTranscript = segment.end;

  for (const { start, end } of record.tracks) {
    const startCut = parseIntoSeconds(start);
    const endCut = parseIntoSeconds(end);

    if (startTranscript >= startCut && startTranscript <= endCut) {
      return true;
    }

    if (endTranscript >= startCut && endTranscript <= endCut) {
      return true;
    }
  }

  return false;
}

export default EpisodeDescriptionChatButton;
