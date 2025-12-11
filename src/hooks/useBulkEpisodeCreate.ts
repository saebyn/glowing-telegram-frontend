import type {
  Episode,
  VideoClip as OutputVideoClip,
  Series,
  Stream,
} from '@saebyn/glowing-telegram-types';
import type { VideoClip as InputVideoClip } from '@saebyn/glowing-telegram-video-editor';
import { useMutation } from '@tanstack/react-query';
import {
  useDataProvider,
  useGetManyReference,
  useNotify,
  useReference,
} from 'react-admin';
import convertEpisodeToCutList from '@/utilities/convertEpisodeToCutList';
import { convertSecondsToISODuration } from '@/utilities/isoDuration';

export default function useBulkEpisodeCreate(stream: Stream | undefined) {
  const notify = useNotify();
  const dataProvider = useDataProvider();

  const {
    referenceRecord: series,
    isLoading: isLoadingSeries,
    isPending: isPendingSeries,
    error: errorSeries,
  } = useReference<Series>({
    reference: 'series',
    id: stream?.series_id || '', // empty string if no series_id, enabled will be false anyway
    options: { enabled: !!stream?.series_id },
  });

  const {
    data: streamMedia,
    isLoading: isStreamMediaLoading,
    error: streamMediaError,
  } = useGetManyReference<Required<OutputVideoClip>>(
    'video_clips',
    {
      target: 'stream_id',
      id: stream?.id || '',
    },
    {
      enabled: !!stream,
    },
  );

  const {
    mutate,
    isPending,
    error: mutationError,
  } = useMutation<void, Error, Partial<Episode>[]>({
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

  const bulkCreateEpisodes = (clips: InputVideoClip[]) => {
    if (isPending || isPendingSeries || !stream || !series || !streamMedia) {
      return;
    }

    const episodes: Partial<Episode>[] = createEpisodesFromClips(
      streamMedia,
      series,
      clips,
      stream,
    );

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

  const validationError = validateState(stream, series, streamMedia);

  return {
    action: bulkCreateEpisodes,
    isLoading: isLoadingSeries || isStreamMediaLoading,
    isPending,
    errors: [
      errorSeries,
      streamMediaError,
      mutationError,
      validationError,
    ].filter((error) => !!error),
  };
}

function validateState(
  stream: Stream | undefined,
  series: Series | undefined,
  streamMedia: OutputVideoClip[] | undefined,
): Error | undefined {
  if (!stream) {
    return new Error('Stream is required');
  }
  if (!series) {
    return new Error('Series is required');
  }
  if (!streamMedia || streamMedia.length === 0) {
    return new Error('Stream media is required');
  }
  if (!validateSeries(series)) {
    return new Error(
      'Series missing required fields: max_episode_order_index, notify_subscribers, category, tags',
    );
  }
  if (!validateStream(stream)) {
    return new Error(
      'Stream missing required fields: id, series_id, title, description',
    );
  }
  return undefined;
}

function validateSeries(series: Series | undefined): boolean {
  if (!series) {
    return false;
  }
  if (series.max_episode_order_index === undefined) {
    return false;
  }
  if (series.notify_subscribers === undefined) {
    return false;
  }
  if (series.category === undefined) {
    return false;
  }
  if (series.tags === undefined) {
    return false;
  }
  return true;
}

function validateStream(stream: Stream | undefined): boolean {
  if (!stream) {
    return false;
  }
  if (stream.id === undefined) {
    return false;
  }
  if (stream.series_id === undefined) {
    return false;
  }
  if (stream.title === undefined) {
    return false;
  }
  if (stream.description === undefined) {
    return false;
  }
  return true;
}

function createEpisodesFromClips(
  streamMedia: OutputVideoClip[],
  series: Series,
  clips: InputVideoClip[],
  stream: Stream,
): Partial<Episode>[] {
  const processedMediaSegments = streamMedia.slice();

  processedMediaSegments.sort(
    (a, b) => (a.start_time ?? 0) - (b.start_time ?? 0),
  );

  const baseEpIndex = (series.max_episode_order_index || 0) + 1;

  const titleTemplate =
    series.episode_title_template ||
    // biome-ignore lint/suspicious/noTemplateCurlyInString: used for template replacement
    '${title} - Episode ${episode_order_index}';
  const descriptionTemplate =
    // biome-ignore lint/suspicious/noTemplateCurlyInString: used for template replacement
    series.episode_description_template || '${stream_description}';

  const episodes: Partial<Episode>[] = clips
    .map((clip, index) => {
      const templateVars = {
        title: stream.title || '',
        episode_order_index: (baseEpIndex + index).toString(),
        stream_title: stream.title || '',
        stream_description: stream.description || '',
        stream_count: (series.stream_count || 1).toString(),
      };

      const title = applyTemplate(titleTemplate, templateVars);
      const description = applyTemplate(descriptionTemplate, templateVars);

      return {
        stream_id: stream.id,
        series_id: stream.series_id,
        order_index: baseEpIndex + index,
        title,
        description,
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
      };
    })
    .map((episode) => ({
      ...episode,
      cut_list: convertEpisodeToCutList(episode, processedMediaSegments, 60),
    }));
  return episodes;
}

function applyTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : '';
  });
}
