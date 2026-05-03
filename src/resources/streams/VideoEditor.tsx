import type { Stream, VideoClip } from '@saebyn/glowing-telegram-types';
import type {
  VideoClip as InputVideoClip,
  Section,
  TranscriptSegment,
  VideoMetadata,
} from '@saebyn/glowing-telegram-video-editor';
import { lazy, Suspense, useState } from 'react';
import { LoadingIndicator, useGetManyReference, useGetOne } from 'react-admin';
import { useParams } from 'react-router-dom';
import ExportOptionsDialog from '@/components/molecules/ExportOptionsDialog';
import { CONTENT_URL } from '@/environment';
import useBulkEpisodeCreate from '@/hooks/useBulkEpisodeCreate';

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
    data: videoClips,
    isPending: isRelatedVideoClipsPending,
    error: relatedVideoClipsError,
  } = useGetManyReference<Required<VideoClip>>(
    'video_clips',
    {
      target: 'stream_id',
      id,
      sort: {
        field: 'start_time',
        order: 'ASC',
      }
    },
    {
      enabled: !!id,
    },
  );

  const {
    action: handleBulkCreateEpisodes,
    errors: bulkCreateEpisodesErrors,
    isLoading: isBulkCreateEpisodesLoading,
  } = useBulkEpisodeCreate(stream, videoClips);

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

  if (bulkCreateEpisodesErrors.length > 0) {
    return (
      <p>Error: {bulkCreateEpisodesErrors.map((e) => e.message).join(', ')}</p>
    );
  }

  if (
    isStreamPending ||
    isRelatedVideoClipsPending ||
    isBulkCreateEpisodesLoading
  ) {
    return <LoadingIndicator />;
  }

  // Calculate the total length of the video clips in milliseconds
  const length = videoClips.reduce(
    (acc, videoClip) =>
      acc + (videoClip.metadata?.format?.duration ?? 0) * 1000,
    0,
  );

  const content: VideoMetadata = {
    ...getVideoClipAnnotations(videoClips),
    chat_history: [],
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

  console.log('all clips', videoClips);

  for (const videoClip of videoClips) {
    if (videoClip.start_time === undefined) {
      throw new Error('Video clip has no start time');
    }

    const offsetMs = videoClip.start_time * 1000.0;

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
  }

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
