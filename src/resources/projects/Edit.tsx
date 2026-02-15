import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import type { StreamClip } from '@saebyn/glowing-telegram-types';
import {
  ProjectClipPool,
  type VideoClip,
} from '@saebyn/glowing-telegram-video-editor';
import { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  type EditProps,
  required,
  SimpleForm,
  TextInput,
  useDataProvider,
  useInput,
} from 'react-admin';

function useVideoClipsForStreamIds(streamIds: string[]): {
  [streamId: string]: VideoClip[];
} {
  console.log('useVideoClipsForStreamIds called with stream IDs:', streamIds);
  const dataProvider = useDataProvider();

  // Fetch video clips for each stream ID
  const [clipsByStreamId, setClipsByStreamId] = useState<{
    [streamId: string]: VideoClip[];
  }>({});

  useEffect(() => {
    console.log('useEffect triggered for stream IDs:', streamIds);
    const abortController = new AbortController();
    const fetchClips = async () => {
      console.log('Fetching clips for stream IDs:', streamIds);
      for (const streamId of streamIds) {
        try {
          const { data } = await dataProvider.getList('video_clips', {
            filter: { stream_id: streamId },
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'start_time', order: 'ASC' },
            signal: abortController.signal,
          });
          setClipsByStreamId((records) => ({
            ...records,
            [streamId]: data,
          }));
        } catch (error) {
          if (abortController.signal.aborted) {
            console.log(`Fetch aborted for stream ID ${streamId}`);
            return; // Exit if the fetch was aborted
          }
          console.error(
            `Error fetching clips for stream ID ${streamId}:`,
            error,
          );
          setClipsByStreamId((records) => ({
            ...records,
            [streamId]: [],
          }));
        }
      }
    };

    if (streamIds.length > 0) {
      console.log('Initiating fetch for stream IDs:', streamIds);
      fetchClips();
    }

    return () => {
      console.log('Cleaning up fetch for stream IDs:', streamIds);
      abortController.abort(); // Cleanup on unmount or when streamIds change
    };
  }, [streamIds, dataProvider]);

  return clipsByStreamId;
}

function ProjectClipPoolInput({
  source,
  label,
}: {
  source: string;
  label?: string;
}) {
  const {
    id,
    field,
    fieldState: { error },
  } = useInput({ source });

  const sourceValue: StreamClip[] = field.value || [];
  const clips: VideoClip[] = useMemo(
    () =>
      sourceValue
        .map((clip) => ({
          start: clip.start_time * 1000, // convert seconds to ms
          end: clip.end_time * 1000, // convert seconds to ms
          title: clip.title,
          id: `${id}-${clip.stream_id}-${clip.start_time}-${clip.end_time}`,
        }))
        .filter(
          (clip, index, self) =>
            index === self.findIndex((c) => c.id === clip.id),
        ), // Filter out clips with duplicate IDs (if any)
    [sourceValue, id],
  );

  const streamIds = useMemo(
    () =>
      sourceValue
        .map((clip) => clip.stream_id)
        .filter((id, index, self) => self.indexOf(id) === index), // Get unique stream IDs
    [sourceValue],
  );

  const clipsByStreamId = useVideoClipsForStreamIds(streamIds);

  console.log('Clips by Stream ID:', clipsByStreamId);

  return (
    <div id={id}>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <ProjectClipPool
        clips={clips}
        keyframes={{}}
        thumbnails={{}}
        titles={{}}
      />

      {error && <span>{error.message}</span>}
    </div>
  );
}

function ProjectEdit(props: EditProps) {
  return (
    <Edit {...props} title="Edit Project">
      <SimpleForm>
        <Card variant="outlined" sx={{ mb: 2, p: 2, width: '100%' }}>
          <CardHeader title="Project Details" />
          <CardContent>
            <TextInput source="title" validate={required()} />
            <TextInput source="description" multiline rows={3} />
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ mb: 2, p: 2, width: '100%' }}>
          <ProjectClipPoolInput source="cuts" label="Clips in the project" />
        </Card>
      </SimpleForm>
    </Edit>
  );
}

export default ProjectEdit;
