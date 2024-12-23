import { convertSecondsToISODuration } from '@/isoDuration';
import type { DataStreamDataElement } from '@/types';
import type { StreamRecord } from '@/types/dataProvider';
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
  stream?: StreamRecord;
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
    string | null,
    Error,
    DataStreamDataElement[]
  >({
    mutationKey: ['bulkCreateEpisodes', stream?.id],
    mutationFn: (segments) => {
      if (isLoadingSeries) {
        return;
      }

      const baseEpIndex = (series?.max_episode_order_index || 0) + 1;

      return dataProvider.bulkCreate(
        'episodes',
        segments.map((segment, index) => ({
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
      );
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
    return <div>{errorSeries}</div>;
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
