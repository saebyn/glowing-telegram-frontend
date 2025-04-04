import DescriptionInput from '@/components/atoms/DescriptionInput';
import TitleInput from '@/components/atoms/TitleInput';
import {
  Create,
  type CreateProps,
  DateTimeInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';

const StreamCreate = (props: CreateProps) => (
  <Create {...props} title="Create a Stream" redirect="list">
    <SimpleForm>
      <TitleInput source="title" required />
      <DescriptionInput source="description" />

      <TextInput source="thumbnail" fullWidth />

      <SelectInput
        source="stream_platform"
        choices={[
          { id: 'twitch', name: 'Twitch' },
          { id: 'youtube', name: 'YouTube' },
        ]}
        required
        defaultValue="twitch"
      />
      <TextInput source="stream_id" />

      <DateTimeInput source="stream_date" required />

      <TextInput
        source="prefix"
        required
        helperText="The prefix is used to identify related video clips for this stream. It's typically in the format YYYY-MM-DD."
        inputProps={{ pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}' }}
      />
    </SimpleForm>
  </Create>
);

export default StreamCreate;
