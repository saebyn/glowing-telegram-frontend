import ExportOptionsDialog from '@/components/molecules/ExportOptionsDialog';
import useBulkEpisodeCreate from '@/hooks/useBulkEpisodeCreate';
import type { StreamChatMessage } from '@/types';
import type { Stream, VideoClip } from '@saebyn/glowing-telegram-types';
import type {
  ChatMessage,
  VideoClip as InputVideoClip,
  Section,
  TranscriptSegment,
  VideoMetadata,
} from '@saebyn/glowing-telegram-video-editor';
import { Suspense, lazy, useState } from 'react';
import { LoadingIndicator, useGetManyReference } from 'react-admin';
import { useGetOne } from 'react-admin';
import { useParams } from 'react-router-dom';

const { VITE_CONTENT_URL: CONTENT_URL } = import.meta.env;

const VideoSelectionPage = lazy(async () => {
  const { VideoSelectionPage } = await import(
    '@saebyn/glowing-telegram-video-editor'
  );

  return { default: VideoSelectionPage };
});

function VideoEditor() {
  const { id } = useParams();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedClips, setSelectedClips] = useState<InputVideoClip[]>([]);

  const {
    data: stream,
    isPending: isStreamPending,
    error: streamError,
  } = useGetOne<Stream>('streams', { id });

  const {
    action: handleBulkCreateEpisodes,
    errors: bulkCreateEpisodesErrors,
    isLoading: isBulkCreateEpisodesLoading,
  } = useBulkEpisodeCreate(stream);

  const {
    data: rawRelatedVideoClips,
    isPending: isRelatedVideoClipsPending,
    error: relatedVideoClipsError,
  } = useGetManyReference<Required<VideoClip>>(
    'video_clips',
    {
      target: 'stream_id',
      id,
    },
    {
      enabled: !!id,
    },
  );

  const {
    data: chatMessages,
    isPending: isChatMessagesPending,
    error: chatMessagesError,
  } = useGetManyReference<StreamChatMessage>(
    'chat_messages',
    {
      target: 'channel_id',
      id,
      pagination: { page: 1, perPage: 1000 },
      sort: { field: 'timestamp', order: 'ASC' },
    },
    {
      enabled: !!id,
    },
  );

  const handleExport = (clips: InputVideoClip[]) => {
    setSelectedClips(clips);
    setExportDialogOpen(true);
  };

  const handleCreateEpisodes = (clips: InputVideoClip[]) => {
    handleBulkCreateEpisodes(clips);
  };

  if (id == null) {
    return <p>No stream ID provided</p>;
  }

  if (streamError) {
    return <p>Error: {streamError.message}</p>;
  }

  if (relatedVideoClipsError) {
    return <p>Error: {relatedVideoClipsError.message}</p>;
  }

  if (chatMessagesError) {
    return <p>Error: {chatMessagesError.message}</p>;
  }

  if (bulkCreateEpisodesErrors.length > 0) {
    return (
      <p>Error: {bulkCreateEpisodesErrors.map((e) => e.message).join(', ')}</p>
    );
  }

  if (
    isStreamPending ||
    isRelatedVideoClipsPending ||
    isChatMessagesPending ||
    isBulkCreateEpisodesLoading
  ) {
    return <LoadingIndicator />;
  }

  // Make a copy of the video clips so we can sort them
  const videoClips = [...(rawRelatedVideoClips ?? [])];

  videoClips.sort((a, b) => {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key > b.key) {
      return 1;
    }
    return 0;
  });

  // Calculate the total length of the video clips in milliseconds
  const length = videoClips.reduce(
    (acc, videoClip) =>
      acc + (videoClip.metadata?.format?.duration ?? 0) * 1000,
    0,
  );

  // Transform chat messages to match VideoMetadata ChatMessage format
  // Backend provides timestamps in seconds, convert to milliseconds
  const transformedChatMessages: ChatMessage[] = (chatMessages ?? []).map(
    (msg) => ({
      timestamp: Math.round(msg.timestamp * 1000),
      username: msg.username,
      message: msg.message,
    }),
  );

  const content: VideoMetadata = {
    ...getVideoClipAnnotations(videoClips),
    chat_history: transformedChatMessages,
    length,

    title: stream?.title ?? '',
    video_url: new URL(`/playlist/${id}.m3u8`, CONTENT_URL)
      .toString()
      .toString(),
  };

  return (
    <>
      <Suspense fallback={<LoadingIndicator />}>
        <VideoSelectionPage content={content} onExport={handleExport} />
      </Suspense>

      {stream && (
        <ExportOptionsDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          clips={selectedClips}
          stream={stream}
          onCreateEpisodes={handleCreateEpisodes}
        />
      )}
    </>
  );
}

function getVideoClipAnnotations(videoClips: VideoClip[]): {
  attentions: Section[];
  highlights: Section[];
  transcription_errors: Section[];
  silences: Section[];
  transcript: TranscriptSegment[];
} {
  const attentions: Section[] = [];
  const highlights: Section[] = [];
  const transcriptionErrors: Section[] = [];
  const silences: Section[] = [];
  const transcript: TranscriptSegment[] = [];

  let offsetMs = 0;

  for (const videoClip of videoClips) {
    if (!videoClip.metadata?.format?.duration) {
      throw new Error('Video clip has no duration');
    }

    for (const attention of videoClip.summary?.attentions ?? []) {
      attentions.push({
        timestamp: convertMsZero(attention.timestamp_start, offsetMs),
        timestamp_end: convertMs(attention.timestamp_end, offsetMs),
        description: attention.description ?? '',
        reasoning: attention.reasoning ?? '',
      });
    }

    for (const highlight of videoClip.summary?.highlights ?? []) {
      highlights.push({
        timestamp: convertMsZero(highlight.timestamp_start, offsetMs),
        timestamp_end: convertMs(highlight.timestamp_end, offsetMs),
        description: highlight.description ?? '',
        reasoning: highlight.reasoning ?? '',
      });
    }

    for (const transcriptionError of videoClip.summary?.transcription_errors ??
      []) {
      transcriptionErrors.push({
        timestamp: convertMsZero(transcriptionError.timestamp_start, offsetMs),
        description: transcriptionError.description ?? '',
        reasoning: transcriptionError.reasoning ?? '',
      });
    }

    for (const silence of videoClip.silence ?? []) {
      silences.push({
        timestamp: convertMsZero(silence.start, offsetMs),
        timestamp_end: convertMs(silence.end, offsetMs),
      });
    }

    for (const segment of videoClip.transcription?.segments ?? []) {
      transcript.push({
        timestamp: convertMsZero(segment.start, offsetMs),
        text: segment.text,
      });
    }

    offsetMs += videoClip.metadata.format.duration * 1000;
  }

  attentions.sort((a, b) => a.timestamp - b.timestamp);
  highlights.sort((a, b) => a.timestamp - b.timestamp);
  transcriptionErrors.sort((a, b) => a.timestamp - b.timestamp);
  silences.sort((a, b) => a.timestamp - b.timestamp);
  transcript.sort((a, b) => a.timestamp - b.timestamp);

  return {
    attentions,
    highlights,
    transcription_errors: transcriptionErrors,
    silences,
    transcript,
  };
}

function convertMs(
  seconds: number | undefined,
  offsetMs: number,
): number | undefined {
  if (seconds == null) {
    return undefined;
  }
  return Math.round(seconds * 1000 + offsetMs);
}

function convertMsZero(seconds: number | undefined, offsetMs: number): number {
  if (seconds == null) {
    return 0;
  }
  return Math.round(seconds * 1000 + offsetMs);
}

export default VideoEditor;
