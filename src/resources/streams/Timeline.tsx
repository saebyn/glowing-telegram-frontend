import BulkCreateEpisodesButton from '@/components/molecules/BulkEpisodeCreateButton';
import StreamTimeline, {
  type Segment,
} from '@/components/molecules/StreamTimeline';
import type { StreamRecord, VideoClipRecord } from '@/types/dataProvider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useEffect, useMemo, useState } from 'react';
import { EditButton, ListButton } from 'react-admin';
import {
  Title,
  useGetManyReference,
  useGetOne,
  useTranslate,
} from 'react-admin';
import { useParams } from 'react-router-dom';

function Timeline() {
  const { id } = useParams();
  const translate = useTranslate();

  const { data, isPending, error } = useGetManyReference<VideoClipRecord>(
    'video_clips',
    {
      target: 'stream_id',
      id,
    },
  );

  const {
    data: stream,
    isLoading: isStreamLoading,
    error: streamError,
  } = useGetOne<StreamRecord>('streams', { id });

  const silenceIntervals = useMemo(() => {
    return (
      data?.flatMap((record, idx) =>
        (record.silence || []).map((sil, sIdx) => ({
          id: Number.parseInt(`${idx}${sIdx}`, 10),
          start: sil.start + record.start_time,
          end: sil.end + record.start_time,
        })),
      ) || []
    );
  }, [data]);

  const sortedSilenceIntervals = useMemo(
    () => silenceIntervals.slice().sort((a, b) => a.start - b.start),
    [silenceIntervals],
  );

  const suggestedCuts = useMemo(() => {
    if (!stream) return [];

    // starting at time 0, ending at the first silence interval, and then
    // alternating between silence intervals and video clips
    const cuts = [];
    let idx = 0;
    let lastEnd = 0;
    for (const interval of sortedSilenceIntervals) {
      cuts.push({ start: lastEnd, end: interval.start, id: idx++ });
      lastEnd = interval.end;
    }
    cuts.push({ start: lastEnd, end: stream.duration, id: idx++ });
    return cuts.filter((cut) => cut.end - cut.start > 0);
  }, [sortedSilenceIntervals, stream]);

  const [segments, setSegments] = useState<Segment[]>(suggestedCuts);

  useEffect(() => {
    setSegments(suggestedCuts);
  }, [suggestedCuts]);

  const handleUpdateSegments = (updatedSegments: Segment[]) => {
    setSegments(updatedSegments);
  };

  const handleResetSegments = () => {
    setSegments(suggestedCuts);
  };

  const duration = stream?.duration || 0;

  if (isPending || isStreamLoading) return <div>Loading...</div>;

  if (error || streamError)
    return <div>Error: {error?.message || streamError?.message}</div>;

  const defaultTitle = translate('resources.streams_timeline.name', {
    smart_count: 1,
    _: 'Stream Timeline',
  });

  const title = stream && `${defaultTitle}: ${stream.title}`;

  return (
    <Box>
      <Title title={title} defaultTitle={defaultTitle} />
      <Box m={2} display="flex" justifyContent="flex-end">
        <BulkCreateEpisodesButton
          color="primary"
          variant="contained"
          label={translate('resources.episodes.bulk_create', {
            smart_count: 1,
            _: 'Create Episodes from Segments',
          })}
          segments={segments}
          stream={stream}
        />
        <EditButton record={stream} />
        <ListButton />
      </Box>
      <Card>
        <CardContent>
          <StreamTimeline
            start={0}
            end={duration}
            segments={segments}
            onUpdate={handleUpdateSegments}
            onReset={handleResetSegments}
            dataStreams={[]}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default Timeline;
