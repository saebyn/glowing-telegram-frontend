import { convertSecondsToISODuration } from '@/utilities/isoDuration';
import type { Stream } from '@saebyn/glowing-telegram-types/src/types';
import type { VideoClip } from '@saebyn/glowing-telegram-video-editor';
import { useMutation } from '@tanstack/react-query';
import { useDataProvider, useNotify, useReference } from 'react-admin';

export default function useBulkEpisodeCreate(stream: Stream | undefined) {
  const notify = useNotify();
  const dataProvider = useDataProvider();

  const {
    referenceRecord: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
  } = useReference({
    reference: 'series',
    id: stream?.series_id || '', // empty string if no series_id, enabled will be false anyway
    options: { enabled: !!stream?.series_id },
  });

  const { mutate, isPending, error } = useMutation<void, Error, VideoClip[]>({
    mutationKey: ['bulkCreateEpisodes', stream?.id],
    mutationFn: async (clips) => {
      if (isLoadingSeries) {
        return;
      }

      const baseEpIndex = (series?.max_episode_order_index || 0) + 1;

      await Promise.all([
        dataProvider.bulkCreate('episodes', {
          data: clips.map((clip, index) => ({
            stream_id: stream?.id,
            series_id: stream?.series_id,
            order_index: baseEpIndex + index,
            title: `${stream?.title} - Episode ${baseEpIndex + index}`,
            tracks: [
              {
                start: convertSecondsToISODuration(clip.start / 1000),
                end: convertSecondsToISODuration(clip.end / 1000),
              },
            ],
            notify_subscribers: series?.notify_subscribers,
            category: series?.category,
            tags: series?.tags,
          })),
        }),
        // update the stream with the has_episodes field
        dataProvider.update('streams', {
          id: stream?.id,
          data: { has_episodes: true },
          previousData: stream,
        }),
      ]);

      // update the series with the new max_episode_order_index
      await dataProvider.update('series', {
        id: series?.id,
        data: { max_episode_order_index: baseEpIndex + clips.length - 1 },
        previousData: series,
      });
    },
  });

  const bulkCreateEpisodes = (clips: VideoClip[]) => {
    if (
      isLoadingSeries ||
      !stream ||
      !series ||
      clips.length === 0 ||
      isPending
    ) {
      return;
    }

    mutate(clips, {
      onSuccess: () => {
        // tell the user that the episodes were created
        notify('gtk.bulk_create_episodes.success', {
          type: 'success',
          messageArgs: {
            smart_count: clips.length,
            _: 'Episodes created',
          },
        });
      },
    });
  };

  return {
    action: bulkCreateEpisodes,
    isLoading: isLoadingSeries,
    isPending,
    error: errorSeries || error,
  };
}
