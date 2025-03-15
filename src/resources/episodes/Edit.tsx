import {
  ArrayInput,
  BooleanInput,
  DeleteButton,
  NumberInput,
  PrevNextButtons,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  TopToolbar,
} from 'react-admin';

import DescriptionInput from '@/components/atoms/DescriptionInput';
import { TimeDurationInput } from '@/components/atoms/TimeDurationInput';
import TitleInput from '@/components/atoms/TitleInput';
import YouTubeCategoryInput from '@/components/atoms/YouTubeCategoryInput';
import EpisodeDescriptionChatButton from '@/components/organisms/EpisodeDescriptionChatButton';
import { ExportButton as OTIOExportButton } from '@/components/organisms/OTIOExporter';
import Edit from '@/components/templates/Edit';

const EditActions = () => (
  <TopToolbar>
    <PrevNextButtons />
    <DeleteButton />
    <OTIOExportButton />
  </TopToolbar>
);

const EpisodeEdit = () => (
  <Edit actions={<EditActions />}>
    <SimpleForm mode="onBlur" reValidateMode="onBlur">
      <TitleInput source="title" />

      <ReferenceInput source="series_id" reference="series">
        <SelectInput
          optionText={(record) =>
            `${record.title} (${record.max_episode_order_index})`
          }
        />
      </ReferenceInput>

      <NumberInput source="order_index" />

      <TextInput source="youtube_video_id" />

      <BooleanInput source="is_published" />

      <DescriptionInput source="description" />

      <EpisodeDescriptionChatButton />

      <ArrayInput source="tracks">
        <SimpleFormIterator>
          <TimeDurationInput source="start" format="iso8601" />
          <TimeDurationInput source="end" format="iso8601" />
        </SimpleFormIterator>
      </ArrayInput>

      <ReferenceInput source="stream_id" reference="streams">
        <SelectInput
          optionText={(record) =>
            `${new Date(record.stream_date).toDateString()} (${record.title})`
          }
        />
      </ReferenceInput>

      <BooleanInput source="notify_subscribers" />
      <YouTubeCategoryInput source="category" />
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default EpisodeEdit;
