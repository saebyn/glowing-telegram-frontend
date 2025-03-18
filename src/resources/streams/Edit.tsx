import {
  BooleanInput,
  DateTimeInput,
  ListButton,
  PrevNextButtons,
  ReferenceInput,
  SelectInput,
  ShowButton,
  SimpleForm,
  TextInput,
  TopToolbar,
} from 'react-admin';

import DescriptionInput from '@/components/atoms/DescriptionInput';
import IngestStreamVideosButton from '@/components/atoms/IngestStreamVideosButton';
import { TimeDurationInput } from '@/components/atoms/TimeDurationInput';
import TitleInput from '@/components/atoms/TitleInput';
import Edit, { type EditProps } from '@/components/templates/Edit';

const StreamEditActions = () => (
  <TopToolbar>
    <PrevNextButtons />
    <IngestStreamVideosButton />
    <ListButton />
    <ShowButton />
  </TopToolbar>
);

const StreamEdit = (props: EditProps) => (
  <Edit {...props} actions={<StreamEditActions />}>
    <SimpleForm>
      <TitleInput source="title" required />

      <ReferenceInput source="series_id" reference="series">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <DescriptionInput source="description" />

      <TextInput source="thumbnail" fullWidth parse={(value) => value} />

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

      <TimeDurationInput source="duration" required format="seconds" />

      <TextInput
        source="prefix"
        required
        helperText="The prefix is used to identify related video clips for this stream. It's typically in the format YYYY-MM-DD."
        inputProps={{ pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}' }}
      />

      <BooleanInput source="has_episodes" />
    </SimpleForm>
  </Edit>
);

export default StreamEdit;
