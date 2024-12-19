import ThumbnailField from '@/components/atoms/ThumbnailField';
import {
  DateField,
  ReferenceArrayField,
  Show,
  type ShowProps,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

const StreamShow = (props: ShowProps) => (
  <Show {...props}>
    <SimpleShowLayout>
      <DateField source="created_at" />
      <TextField source="description" />
      <TextField source="id" />
      <DateField source="prefix" />
      <TextField source="speech_audio_track" />
      <ThumbnailField source="thumbnail" width={100} height={100} />
      <DateField source="title" />
      <ReferenceArrayField source="topic_ids" reference="topics">
        <TextField source="id" />
      </ReferenceArrayField>
      <TextField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default StreamShow;
