import { BulkExportButton } from '@/components/organisms/OTIOExporter/Exporter';
import {
  BooleanField,
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
  TopToolbar,
} from 'react-admin';
import RenderEpisodesButton from '../../components/atoms/RenderEpisodesButton';
import UploadEpisodeToYoutubeButton from './UploadEpisodeToYoutubeButton';

const ListActions = (props: ListActionsProps) => (
  <TopToolbar {...props}>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const BulkActionButtons = () => (
  <>
    <UploadEpisodeToYoutubeButton />

    <RenderEpisodesButton />

    <BulkExportButton />
  </>
);

const episodeFilters = [
  <SearchInput source="title" alwaysOn key="title" />,
  <ReferenceInput source="series_id" reference="series" key="series_id" />,
  <ReferenceInput source="stream_id" reference="streams" key="stream_id" />,
  <NullableBooleanInput source="is_published" key="is_published" />,
  <NullableBooleanInput
    source="youtube_video_id__exists"
    key="youtube_video_id"
    label="Is uploaded"
  />,
  <NullableBooleanInput
    source="render_uri__exists"
    key="render_uri"
    label="Is rendered"
  />,
];

const EpisodeList = (props: ListProps) => (
  <List {...props} filters={episodeFilters} actions={<ListActions />}>
    <Datagrid rowClick="edit" bulkActionButtons={<BulkActionButtons />}>
      <TextField source="title" />
      <ReferenceField source="series_id" reference="series">
        <TextField source="title" />
      </ReferenceField>
      <ReferenceField source="stream_id" reference="streams" label="Stream Date">
        <DateField source="stream_date" />
      </ReferenceField>
      <NumberField source="order_index" />
      <BooleanField source="youtube_video_id" looseValue={true} />
      <BooleanField source="render_uri" looseValue={true} />
      <TextField source="upload_status" />
    </Datagrid>
  </List>
);

export default EpisodeList;
