import type { Stream } from '@saebyn/glowing-telegram-types';
import type { VideoMetadata } from '@saebyn/glowing-telegram-video-editor';
import { Suspense, lazy } from 'react';
import { LoadingIndicator } from 'react-admin';
import { useGetOne } from 'react-admin';
import { useParams } from 'react-router-dom';

const VideoSelectionPage = lazy(async () => {
  const { VideoSelectionPage } = await import(
    '@saebyn/glowing-telegram-video-editor'
  );

  return { default: VideoSelectionPage };
});

function VideoEditor() {
  const { id } = useParams();

  const {
    data: stream,
    isPending: isStreamPending,
    error: streamError,
  } = useGetOne<Stream>('streams', { id });

  if (id == null) {
    return <p>No stream ID provided</p>;
  }

  if (streamError) {
    return <p>Error: {streamError.message}</p>;
  }

  if (isStreamPending) {
    return <LoadingIndicator />;
  }

  // to stop the warning about this being unused
  console.log('stream', stream);

  const content: VideoMetadata = {
    attentions: [],
    chat_history: [],
    highlights: [],
    length: 0,
    silences: [],
    title: '',
    transcription_errors: [],
    transcript: [],
    video_url: '',
  };

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <VideoSelectionPage content={content} />
    </Suspense>
  );
}

export default VideoEditor;
