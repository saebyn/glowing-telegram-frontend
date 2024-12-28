import { TimeDurationInput } from '@/components/atoms/TimeDurationInput';
import YouTubeCategoryInput from '@/components/atoms/YouTubeCategoryInput';
import {
  ArrayInput,
  BooleanInput,
  Create,
  type CreateProps,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
} from 'react-admin';

const EpisodeCreate = (props: CreateProps) => (
  <Create {...props} title="Create an Episode">
    <SimpleForm>
      <TextInput source="title" required />

      <TextInput source="stream_id" isRequired={true} />

      <ReferenceInput source="series_id" reference="series">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <NumberInput source="order_index" />

      <TextInput source="youtube_video_id" />

      <BooleanInput source="is_published" />

      <BooleanInput source="notify_subscribers" />
      <YouTubeCategoryInput source="category" />
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="tracks">
        <SimpleFormIterator>
          <TimeDurationInput source="start" format="iso8601" />
          <TimeDurationInput source="end" format="iso8601" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export default EpisodeCreate;
