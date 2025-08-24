import type { DataStreamDataElement } from '@/types';
import { convertSecondsToISODuration } from '@/utilities/isoDuration';
import type { Stream } from '@saebyn/glowing-telegram-types';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  type ButtonProps,
  useDataProvider,
  useNotify,
  useReference,
} from 'react-admin';

type BulkCreateEpisodesButtonProps = {
  segments: DataStreamDataElement[];
  stream?: Stream;
} & Omit<ButtonProps, 'onClick' | 'disabled'>;

const BulkCreateEpisodesButton = ({
  segments,
  stream,
  ...props
}: BulkCreateEpisodesButtonProps) => {
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

  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    DataStreamDataElement[]
  >({
    mutationKey: ['bulkCreateEpisodes', stream?.id],
    mutationFn: async (segments) => {
      if (isLoadingSeries) {
        return;
      }

      const baseEpIndex = (series?.max_episode_order_index || 0) + 1;

      await Promise.all([
        dataProvider.bulkCreate('episodes', {
          data: segments.map((segment, index) => ({
            stream_id: stream?.id,
            series_id: stream?.series_id,
            order_index: baseEpIndex + index,
            title: `${stream?.title} - Episode ${baseEpIndex + index}`,
            tracks: [
              {
                start: convertSecondsToISODuration(segment.start),
                end: convertSecondsToISODuration(segment.end),
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
        data: { max_episode_order_index: baseEpIndex + segments.length - 1 },
        previousData: series,
      });
    },
  });

  const bulkCreateEpisodes = () => {
    mutate(segments, {
      onSuccess: () => {
        // tell the user that the episodes were created
        notify('gtk.bulk_create_episodes.success', {
          type: 'success',
          messageArgs: {
            smart_count: segments.length,
            _: 'Episodes created',
          },
        });
      },
    });
  };

  if (errorSeries) {
    return <div>{errorSeries.toString()}</div>;
  }

  if (error) {
    return <div>{error.toString()}</div>;
  }

  return (
    <Button
      disabled={isPending || isLoadingSeries}
      {...props}
      onClick={bulkCreateEpisodes}
    />
  );
};

export default BulkCreateEpisodesButton;
