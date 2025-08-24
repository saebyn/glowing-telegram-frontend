import type { Stream } from '@saebyn/glowing-telegram-types';
import type { VideoClip as InputVideoClip } from '@saebyn/glowing-telegram-video-editor';
import { useMutation } from '@tanstack/react-query';
import { useDataProvider, useNotify } from 'react-admin';

export default function useSendCutsToProject(stream: Stream | undefined) {
  const notify = useNotify();
  const dataProvider = useDataProvider();

  const {
    mutate,
    isPending,
    error: mutationError,
  } = useMutation<void, Error, { projectId: string; clips: InputVideoClip[] }>({
    mutationKey: ['sendCutsToProject', stream?.id],
    mutationFn: async ({ projectId, clips }) => {
      if (!stream) {
        throw new Error('Stream is required');
      }

      // Transform clips to the format expected by the project
      const cuts = clips.map((clip) => ({
        stream_id: stream.id,
        start_time: clip.start / 1000, // convert ms to seconds
        end_time: clip.end / 1000, // convert ms to seconds
        title: `Cut from ${stream.title}`,
        keyframe_src: clip.keyframeSrc,
      }));

      // Get current project data
      const project = await dataProvider.getOne('projects', { id: projectId });

      // Append new cuts to existing cuts
      const updatedCuts = [...(project.data.cuts || []), ...cuts];

      // Update the project with new cuts
      await dataProvider.update('projects', {
        id: projectId,
        data: {
          ...project.data,
          cuts: updatedCuts,
          updated_at: new Date().toISOString(),
        },
        previousData: project.data,
      });
    },
  });

  const sendCutsToProject = (projectId: string, clips: InputVideoClip[]) => {
    if (isPending || !stream) {
      return;
    }

    mutate(
      { projectId, clips },
      {
        onSuccess: () => {
          notify('gt.send_cuts_to_project.success', {
            type: 'success',
            messageArgs: {
              smart_count: clips.length,
              _: 'Cuts sent to project',
            },
          });
        },
        onError: (error) => {
          notify('gt.send_cuts_to_project.error', {
            type: 'error',
            messageArgs: {
              _: `Failed to send cuts to project: ${error.message}`,
            },
          });
        },
      },
    );
  };

  return {
    action: sendCutsToProject,
    isPending,
    error: mutationError,
  };
}
