import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import type { StreamClip, VideoClip } from '@saebyn/glowing-telegram-types';
import {
  type VideoClip as EditorVideoClip,
  ProjectClipPool,
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

const { VITE_CONTENT_URL: CONTENT_URL } = import.meta.env;

type VideoClipWithMetadata = Partial<VideoClip> & {
  start_time: number;
  end_time: number;
};

function useVideoClipsForStreamIds(streamIds: string[]): {
  [streamId: string]: VideoClipWithMetadata[];
} {
  const dataProvider = useDataProvider();

  // Fetch video clips for each stream ID
  const [clipsByStreamId, setClipsByStreamId] = useState<{
    [streamId: string]: VideoClipWithMetadata[];
  }>({});

  useEffect(() => {
    const abortController = new AbortController();
    const fetchClips = async () => {
      for (const streamId of streamIds) {
        try {
          const { data } = await dataProvider.getList('video_clips', {
            filter: { stream_id: streamId },
            pagination: { page: 1, perPage: 100 },
            signal: abortController.signal,
          });

          const clips = data.map((clip: VideoClip) => ({
            keyframes: clip.keyframes,
            start_time: clip.start_time || 0,
            end_time:
              (clip.start_time || 0) + (clip.metadata?.format?.duration || 1),
            summary: clip.summary,
            id: clip.id,
          }));

          clips.sort((a, b) => a.start_time - b.start_time);

          setClipsByStreamId((records) => ({
            ...records,
            [streamId]: clips,
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
      fetchClips();
    }

    return () => {
      abortController.abort(); // Cleanup on unmount or when streamIds change
    };
  }, [streamIds, dataProvider]);

  return clipsByStreamId;
}

function getKeyframesForClip(
  streams: { [streamId: string]: VideoClipWithMetadata[] },
  clip: StreamClip,
): string[] {
  const streamClips = streams[clip.stream_id] || [];
  const matchingClips = streamClips.filter(
    (streamClip) =>
      streamClip.start_time <= clip.start_time &&
      streamClip.end_time >= clip.end_time,
  );

  if (matchingClips.length > 0) {
    // We want keyframes from each matching clip, but we also want to avoid duplicates
    // and we want to approximate the keyframe times to the clip's start and end times
    // We will have to approximate the keyframe time by looking at the relative number of keyframes in the clip and the duration of the clip
    const keyframes = new Set<string>();

    for (const matchingClip of matchingClips) {
      const clipDuration = matchingClip.end_time - matchingClip.start_time;
      const clipKeyframes = matchingClip.keyframes || [];

      for (const keyframe of clipKeyframes) {
        // Approximate the keyframe time to the clip's start and end times
        // to do this, we need to look at the index of the keyframe in the clip's keyframes array and the total
        // number of keyframes in the clip, and then we can calculate the relative time of the keyframe in the clip
        // since the keyframe is the image url, we cannot directly get the time of the keyframe directly.
        const keyframeIndex = clipKeyframes.indexOf(keyframe);
        const keyframeTime =
          matchingClip.start_time +
          (keyframeIndex / clipKeyframes.length) * clipDuration;

        // We only want to include keyframes that are within the clip's start and end times
        if (keyframeTime >= clip.start_time && keyframeTime <= clip.end_time) {
          keyframes.add(keyframe);
        }
      }
    }
    return Array.from(keyframes).map((keyframe) =>
      // Now just need to update the keyframe url to be absolute instead of relative
      // using the VITE_CONTENT_URL environment variable
      new URL(keyframe, CONTENT_URL).toString(),
    );
  }

  return [];
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

  const streamIds = useMemo(
    () =>
      sourceValue
        .map((clip) => clip.stream_id)
        .filter((id, index, self) => self.indexOf(id) === index), // Get unique stream IDs
    [sourceValue],
  );

  const clipsByStreamId = useVideoClipsForStreamIds(streamIds);

  const clips: EditorVideoClip[] = useMemo(
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

  const keyframesByClipId = useMemo(() => {
    const keyframesMap: { [clipId: string]: string[] } = {};
    for (const clip of sourceValue) {
      const clipId = `${id}-${clip.stream_id}-${clip.start_time}-${clip.end_time}`;
      keyframesMap[clipId] = getKeyframesForClip(clipsByStreamId, clip);
    }
    return keyframesMap;
  }, [sourceValue, clipsByStreamId, id]);

  const thumbnails = useMemo(() => {
    const thumbnailMap: { [clipId: string]: string } = {};
    for (const clip of sourceValue) {
      const clipId = `${id}-${clip.stream_id}-${clip.start_time}-${clip.end_time}`;
      const keyframes = keyframesByClipId[clipId] || [];
      if (keyframes.length > 0) {
        thumbnailMap[clipId] = keyframes[0]; // Use the first keyframe as the thumbnail
      }
    }
    return thumbnailMap;
  }, [sourceValue, keyframesByClipId, id]);

  return (
    <div id={id}>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <ProjectClipPool
        clips={clips}
        keyframes={keyframesByClipId}
        thumbnails={thumbnails}
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
