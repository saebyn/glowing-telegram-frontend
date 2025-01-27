import type { Stream } from '@saebyn/glowing-telegram-types';
import { VideoSelectionPage } from '@saebyn/glowing-telegram-video-editor';
import { LoadingIndicator } from 'react-admin';
import { useGetOne } from 'react-admin';
import { useParams } from 'react-router-dom';

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

  return <VideoSelectionPage />;
}

export default VideoEditor;
