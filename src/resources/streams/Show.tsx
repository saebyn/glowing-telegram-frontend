import {
  Datagrid,
  DateField,
  NumberField,
  ReferenceManyField,
  Show,
  type ShowProps,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import EpisodesListButton from '@/components/atoms/EpisodesListButton';
import ThumbnailField from '@/components/atoms/ThumbnailField';

const StreamShow = (props: ShowProps) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="title" />
      <ThumbnailField source="thumbnail" width={100} height={100} />

      <TextField source="description" />
      <TextField source="id" />
      <DateField source="prefix" />

      <ReferenceManyField reference="video_clips" target="stream_id">
        <Datagrid>
          <TextField source="key" />
          <NumberField source="start_time" />
          <TextField source="summary.title" label="Title" />
        </Datagrid>
      </ReferenceManyField>

      <EpisodesListButton />

      <DateField source="created_at" />
      <TextField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default StreamShow;
