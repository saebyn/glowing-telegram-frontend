import ThumbnailField from '@/components/atoms/ThumbnailField';
import ImportIcon from '@mui/icons-material/ImportExport';
import type { Stream } from 'glowing-telegram-types/src/types';
import {
  Button,
  Datagrid,
  InfiniteList,
  SimpleShowLayout,
  TextField,
  useDataProvider,
  useListContext,
  useNotify,
  useRefresh,
  useUnselectAll,
} from 'react-admin';

const StreamPanel = () => (
  <SimpleShowLayout>
    <TextField source="id" />

    <TextField source="language" />
    <TextField source="type" />

    <TextField source="url" />
    <TextField source="stream_id" />
    <TextField source="viewable" />
  </SimpleShowLayout>
);

interface TwitchStreamData {
  id: string;
  title: string;
  duration: string;
  thumbnail_url: string;
  stream_id: string;
  created_at: string;
}

const BulkActionButtons = () => {
  const refresh = useRefresh();
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const { selectedIds, data } = useListContext<TwitchStreamData>();
  const unselectAll = useUnselectAll('twitchStreams');

  const handleImport = () => {
    if (!selectedIds.length) {
      return;
    }

    if (data === undefined) {
      return;
    }

    // Notify the user that the import started
    notify('Importing streams');

    // get the selected records
    const selectedRecords = data
      .filter((record) => selectedIds.includes(record.id))
      .map<Omit<Stream, 'id' | 'created_at'>>((record) => {
        // convert the duration in the format "HHhMMmSSs"
        const durationParts = record.duration.match(/(\d+)h(\d+)m(\d+)s/);

        if (!durationParts) {
          throw new Error(`Invalid duration format: ${record.duration}`);
        }

        const durationSeconds =
          Number.parseInt(durationParts[1], 10) * 3600 +
          Number.parseInt(durationParts[2], 10) * 60 +
          Number.parseInt(durationParts[3], 10);

        const createdAt = new Date(record.created_at);
        return {
          title: record.title,
          duration: durationSeconds,
          thumbnail: record.thumbnail_url,
          stream_id: record.stream_id,
          stream_date: record.created_at,
          stream_platform: 'twitch',

          // the date portion of the created_at field
          prefix: `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${createdAt
            .getDate()
            .toString()
            .padStart(2, '0')}`,

          description: `Stream from ${record.created_at}`,
          has_episodes: false,
          video_clip_count: 0,
        };
      });

    // Perform the import
    dataProvider.bulkCreate('streams', { data: selectedRecords }).then(() => {
      notify('Streams imported');

      // Unselect all records
      unselectAll();

      // Refresh the list
      refresh();
    });
  };

  return (
    <Button label="Import" onClick={handleImport} startIcon={<ImportIcon />} />
  );
};

const TwitchStreamsList = () => (
  <InfiniteList>
    <Datagrid
      expand={<StreamPanel />}
      expandSingle
      bulkActionButtons={<BulkActionButtons />}
    >
      <ThumbnailField source="thumbnail_url" label="Thumbnail" />

      <TextField source="title" />

      <TextField source="view_count" />

      <TextField source="created_at" />
      <TextField source="published_at" />

      <TextField source="duration" />
    </Datagrid>
  </InfiniteList>
);

export default TwitchStreamsList;
