import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type { VideoClip } from '@saebyn/glowing-telegram-types';
import type { VideoClip as ProjectVideoClip } from '@saebyn/glowing-telegram-video-editor';
import { ProjectClipPool } from '@saebyn/glowing-telegram-video-editor';
import { useMemo, useState } from 'react';
import {
  DateField,
  LoadingIndicator,
  Show,
  type ShowProps,
  TextField,
  useGetList,
  useNotify,
  useRecordContext,
} from 'react-admin';

const { VITE_CONTENT_URL: CONTENT_URL = '' } = import.meta.env;

interface Cut {
  stream_id: string;
  start_time: number;
  end_time: number;
  title: string;
  keyframe_src?: string;
}

interface Project {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  cuts: Cut[];
}

function ProjectShowContent() {
  const record = useRecordContext<Project>();
  const notify = useNotify();
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(
    new Set(),
  );

  // Fetch all video_clips to match with cuts
  const { data: videoClips, isLoading: isLoadingVideoClips } = useGetList(
    'video_clips',
    {
      pagination: { page: 1, perPage: 1000 },
    },
  );

  // Transform cuts to ProjectClipPool format
  const { clips, thumbnails, keyframes, titles } = useMemo(() => {
    if (!record?.cuts || !videoClips) {
      return {
        clips: [],
        thumbnails: {},
        keyframes: {},
        titles: {},
      };
    }

    const clipsData: ProjectVideoClip[] = [];
    const thumbnailsData: Record<string, string> = {};
    const keyframesData: Record<string, string[]> = {};
    const titlesData: Record<string, string> = {};

    for (const [index, cut] of record.cuts.entries()) {
      // Generate a unique ID for this clip based on stream_id and timing
      const clipId = `${cut.stream_id}-${cut.start_time}-${cut.end_time}`;

      // Find the corresponding video_clip that contains this cut
      // We need to find a video_clip where the cut's timing falls within it
      const videoClip = videoClips.find((vc) => {
        if (vc.stream_id !== cut.stream_id) return false;

        // Check if the cut timing overlaps with this video_clip's range
        const vcStartTime = vc.start_time ?? 0;
        const vcEndTime =
          vcStartTime + (vc.metadata?.format?.duration || 0);
        return cut.start_time >= vcStartTime && cut.start_time < vcEndTime;
      }) as VideoClip | undefined;

      // Create clip data
      clipsData.push({
        id: clipId,
        start: cut.start_time * 1000, // convert seconds to milliseconds
        end: cut.end_time * 1000, // convert seconds to milliseconds
      });

      // Set title
      titlesData[clipId] = cut.title || `Clip ${index + 1}`;

      // Set keyframes if video_clip is found
      if (videoClip?.keyframes && videoClip.keyframes.length > 0) {
        // Use first keyframe as thumbnail
        thumbnailsData[clipId] = new URL(
          videoClip.keyframes[0],
          CONTENT_URL,
        ).toString();

        // Use all keyframes for animation
        keyframesData[clipId] = videoClip.keyframes.map((kf) =>
          new URL(kf, CONTENT_URL).toString(),
        );
      } else {
        // Fallback if no keyframes available
        thumbnailsData[clipId] = '';
        keyframesData[clipId] = [];
      }
    }

    return {
      clips: clipsData,
      thumbnails: thumbnailsData,
      keyframes: keyframesData,
      titles: titlesData,
    };
  }, [record?.cuts, videoClips]);

  const handleClipSelect = (clipId: string, selected: boolean) => {
    setSelectedClipIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(clipId);
      } else {
        newSet.delete(clipId);
      }
      return newSet;
    });
  };

  const handleCreateEpisode = () => {
    if (selectedClipIds.size === 0) {
      notify('Please select at least one clip', { type: 'warning' });
      return;
    }
    // TODO: Implement create episode from selected clips
    notify(
      `Creating episode from ${selectedClipIds.size} clip(s) - Not yet implemented`,
      { type: 'info' },
    );
  };

  const handlePreview = () => {
    if (selectedClipIds.size === 0) {
      notify('Please select at least one clip', { type: 'warning' });
      return;
    }
    // TODO: Implement preview selected clips
    notify(`Previewing ${selectedClipIds.size} clip(s) - Not yet implemented`, {
      type: 'info',
    });
  };

  const handleRemoveSelected = () => {
    if (selectedClipIds.size === 0) {
      notify('Please select at least one clip', { type: 'warning' });
      return;
    }
    // TODO: Implement remove selected clips from project
    notify(`Removing ${selectedClipIds.size} clip(s) - Not yet implemented`, {
      type: 'info',
    });
  };

  if (!record) {
    return null;
  }

  if (isLoadingVideoClips) {
    return <LoadingIndicator />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <TextField source="title" />
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            <TextField source="description" />
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Created:{' '}
              </Typography>
              <DateField source="created_at" showTime />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Updated:{' '}
              </Typography>
              <DateField source="updated_at" showTime />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Toolbar sx={{ mb: 2, px: 0 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Clips ({clips.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateEpisode}
                disabled={selectedClipIds.size === 0}
              >
                Create Episode from Selected
              </Button>
              <Button
                variant="outlined"
                onClick={handlePreview}
                disabled={selectedClipIds.size === 0}
              >
                Preview Selected
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveSelected}
                disabled={selectedClipIds.size === 0}
              >
                Remove Selected
              </Button>
            </Stack>
          </Toolbar>

          {clips.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center">
              No clips in this project yet. Add clips from the stream editor.
            </Typography>
          ) : (
            <ProjectClipPool
              clips={clips}
              thumbnails={thumbnails}
              keyframes={keyframes}
              titles={titles}
              clipWidth="240px"
              clipHeight="135px"
              onClipSelect={handleClipSelect}
              showCheckboxes
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

const ProjectShow = (props: ShowProps) => (
  <Show {...props} title="Project Details">
    <ProjectShowContent />
  </Show>
);

export default ProjectShow;
