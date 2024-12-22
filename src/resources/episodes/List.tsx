import { BulkExportButton } from '@/components/organisms/OTIOExporter/Exporter';
import {
  CreateButton,
  Datagrid,
  DateField,
  FilterButton,
  List,
  type ListActionsProps,
  type ListProps,
  NullableBooleanInput,
  NumberField,
  ReferenceField,
  ReferenceInput,
  SearchInput,
  TextField,
  TextInput,
  TopToolbar,
} from 'react-admin';
import TriggerRenderFileScanButton from './TriggerRenderFileScanButton';
import UploadEpisodeToYoutubeButton from './UploadEpisodeToYoutubeButton';

const ListActions = (props: ListActionsProps) => (
  <TopToolbar {...props}>
    <FilterButton />
    <CreateButton />
    <TriggerRenderFileScanButton />
  </TopToolbar>
);

const BulkActionButtons = () => (
  <>
    <UploadEpisodeToYoutubeButton />

    <BulkExportButton />
  </>
);

const episodeFilters = [
  <SearchInput source="title" alwaysOn key="title" />,
  <ReferenceInput source="series_id" reference="series" key="series_id" />,
  <ReferenceInput source="stream_id" reference="streams" key="stream_id" />,
  <NullableBooleanInput
    source="has_youtube_video_id"
    key="has_youtube_video_id"
  />,
  <NullableBooleanInput source="is_published" key="is_published" />,
];

const EpisodeList = (props: ListProps) => (
  <List {...props} filters={episodeFilters} actions={<ListActions />}>
    <Datagrid rowClick="edit" bulkActionButtons={<BulkActionButtons />}>
      <TextField source="title" />
      <ReferenceField source="series_id" reference="series">
        <TextField source="title" />
      </ReferenceField>
      <NumberField source="order_index" />

      <DateField source="stream_date" />
    </Datagrid>
  </List>
);

export default EpisodeList;
