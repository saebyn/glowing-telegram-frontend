import convertEpisodeToCutList from '@/utilities/convertEpisodeToCutList';
import { convertSecondsToISODuration } from '@/utilities/isoDuration';
import type {
  Episode,
  Stream,
  VideoClip as StreamMedia,
} from '@saebyn/glowing-telegram-types/src/types';
import type { VideoClip } from '@saebyn/glowing-telegram-video-editor';
import { useMutation } from '@tanstack/react-query';
import {
  useDataProvider,
  useGetManyReference,
  useNotify,
  useReference,
} from 'react-admin';

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

  const {
    data: streamMedia,
    isLoading: isStreamMediaLoading,
    error: streamMediaError,
  } = useGetManyReference(
    'video_clips',
    {
      target: 'stream_id',
      id: stream?.id || '',
    },
    {
      enabled: !!stream,
    },
  );

  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    Partial<Episode>[]
  >({
    mutationKey: ['bulkCreateEpisodes', stream?.id],
    mutationFn: async (episodes) => {
      if (isLoadingSeries) {
        return;
      }
      await Promise.all([
        dataProvider.bulkCreate('episodes', {
          data: episodes,
        }),
        // update the stream with the has_episodes field
        dataProvider.update('streams', {
          id: stream?.id,
          data: { has_episodes: true },
          previousData: stream,
        }),
      ]);

      const newMaxEpisodeOrderIndex =
        episodes[episodes.length - 1].order_index || 0;

      // update the series with the new max_episode_order_index
      await dataProvider.update('series', {
        id: series?.id,
        data: { max_episode_order_index: newMaxEpisodeOrderIndex },
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

    if (!stream || !series || !streamMedia) {
      return;
    }

    const processedMediaSegments = streamMedia.map(
      (mediaSegment: StreamMedia) => ({
        uri: mediaSegment.key,
        duration: mediaSegment.metadata?.format?.duration || 0,
        start_time: mediaSegment.start_time,
      }),
    );

    processedMediaSegments.sort(
      (a, b) => (a.start_time ?? 0) - (b.start_time ?? 0),
    );

    const streamWithVideoClips = {
      ...stream,
      video_clips: processedMediaSegments,
      series_id: stream.series_id || null,
    };

    const baseEpIndex = (series?.max_episode_order_index || 0) + 1;

    const episodes: Partial<Episode>[] = clips
      .map((clip, index) => ({
        stream_id: stream.id,
        series_id: stream.series_id,
        order_index: baseEpIndex + index,
        title: `${stream.title} - Episode ${baseEpIndex + index}`,
        description: stream.description || '',
        notify_subscribers: series.notify_subscribers,
        category: series.category,
        tags: series.tags,
        is_published: false,
        tracks: [
          {
            start: convertSecondsToISODuration(clip.start / 1000),
            end: convertSecondsToISODuration(clip.end / 1000),
          },
        ],
      }))
      .map((episode) => ({
        ...episode,
        cut_list: convertEpisodeToCutList(episode, streamWithVideoClips, 60),
      }));

    mutate(episodes, {
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
    isLoading: isLoadingSeries || isStreamMediaLoading,
    isPending,
    error: errorSeries || streamMediaError || error,
  };
}
