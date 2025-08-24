import DownloadIcon from '@mui/icons-material/Download';
import {
  Button,
  useDataProvider,
  useGetManyReference,
  useListContext,
  useRecordContext,
} from 'react-admin';

import type { Episode, VideoClip } from '@saebyn/glowing-telegram-types';
import exporter from './export';

function promptDownload(episode: Episode, videoClips: VideoClip[]) {
  const sortedVideoClips = [...videoClips].sort(
    (a, b) => (a.start_time ?? 0) - (b.start_time ?? 0),
  );
  // take the episode data and use the OTIOExporter to genrate the OTIO string
  // then create a blob object and create a download link
  // then click the link to download the file
  let otioString: string;
  try {
    otioString = exporter(
      {
        title: episode.title || '',
        description: episode.description || '',
        tracks: (episode.tracks || []).map(
          (track: { start: string; end: string }) => ({
            start: track.start,
            end: track.end,
          }),
        ),
      },
      sortedVideoClips,
    );
  } catch (e) {
    console.error('Error exporting OTIO file', e, {
      episode,
      videoClips,
    });

    alert('Error exporting OTIO file. See console for details.');
    return;
  }

  const blob = new Blob([otioString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // set the filename to the episode name
  a.download = `${episode.title}.otio`;
  a.click();
}

export const ExportButton = () => {
  const episode = useRecordContext<Episode>();
  const {
    data: videoClips,
    isLoading,
    error,
    refetch,
  } = useGetManyReference(
    'video_clips',
    {
      target: 'stream_id',
      id: episode?.stream_id || '',
    },
    {
      enabled: !!episode,
    },
  );

  if (!episode) {
    return null;
  }

  if (error) {
    // show an error message and a retry button
    return (
      <div>
        <p>There was an error loading the stream data.</p>
        <Button onClick={() => refetch()} label="Retry" />
      </div>
    );
  }

  const handleExport = () => {
    if (!episode || !videoClips) return;
    if (isLoading) return;
    if (error) return;
    if (!episode.tracks || episode.tracks.length === 0) {
      alert('Episode has no cuts to export.');
      return;
    }
    if (!videoClips || videoClips.length === 0) {
      alert('Stream has no video clips to export.');
      return;
    }

    promptDownload(episode, videoClips);
  };

  return (
    <Button
      label="Export OTIO"
      onClick={handleExport}
      startIcon={<DownloadIcon />}
      disabled={isLoading}
    />
  );
};

export const BulkExportButton = () => {
  const { selectedIds } = useListContext();
  const dataProvider = useDataProvider();

  const handleExport = async () => {
    for (const id of selectedIds) {
      const { data: episode } = await dataProvider.getOne('episodes', {
        id,
      });

      if (!episode.tracks || episode.tracks.length === 0) {
        alert('Episode has no cuts to export.');
        return;
      }

      const { data: videoClips } = await dataProvider.getManyReference(
        'video_clips',
        {
          target: 'stream_id',
          id: episode.stream_id || '',
          filter: {},
          pagination: { page: 1, perPage: 1000 },
          sort: { field: 'start_time', order: 'ASC' },
        },
      );

      if (!videoClips || videoClips.length === 0) {
        alert('Stream has no video clips to export.');
        return;
      }

      promptDownload(episode, videoClips);
    }
  };

  return <Button label="Bulk Export OTIO" onClick={handleExport} />;
};
