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
  Tab,
  TabbedForm,
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
    <TabbedForm mode="onBlur" reValidateMode="onBlur">
      <TabbedForm.Tab label="Summary">
        <TitleInput source="title" />

        <ReferenceInput source="series_id" reference="series">
          <SelectInput
            optionText={(record) =>
              `${record.title} (${record.max_episode_order_index})`
            }
          />
        </ReferenceInput>

        <NumberInput source="order_index" />

        <DescriptionInput source="description" />

        <EpisodeDescriptionChatButton />

        <ReferenceInput source="stream_id" reference="streams">
          <SelectInput
            optionText={(record) =>
              `${new Date(record.stream_date).toDateString()} (${record.title})`
            }
          />
        </ReferenceInput>
      </TabbedForm.Tab>

      <TabbedForm.Tab label="Render">
        <ArrayInput source="cut_list.inputMedia">
          <SimpleFormIterator inline>
            <TextInput source="s3Location" />
            <ArrayInput source="sections">
              <SimpleFormIterator>
                <NumberInput source="startFrame" />
                <NumberInput source="endFrame" />
              </SimpleFormIterator>
            </ArrayInput>
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayInput source="cut_list.outputTrack">
          <SimpleFormIterator inline>
            <NumberInput source="mediaIndex" />
            <NumberInput source="sectionIndex" />
            <TextInput source="transition.type" />
            <NumberInput source="transition.duration" />
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayInput source="cut_list.overlayTracks">
          <SimpleFormIterator inline>
            <NumberInput source="startFrame" />
            <NumberInput source="mediaIndex" />
            <NumberInput source="sectionIndex" />
            <NumberInput source="x" />
            <NumberInput source="y" />
            <TextInput source="type" />
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayInput source="tracks" label="Legacy tracks list">
          <SimpleFormIterator inline>
            <TimeDurationInput source="start" format="iso8601" />
            <TimeDurationInput source="end" format="iso8601" />
          </SimpleFormIterator>
        </ArrayInput>

        <TextInput source="youtube_video_id" />
        <TextInput source="render_uri" />

        <BooleanInput source="is_published" />
      </TabbedForm.Tab>

      <TabbedForm.Tab label="YouTube">
        <TextInput source="youtube_video_id" />
        <BooleanInput source="notify_subscribers" />
        <YouTubeCategoryInput source="category" />
        <ArrayInput source="tags">
          <SimpleFormIterator>
            <TextInput source="" />
          </SimpleFormIterator>
        </ArrayInput>
      </TabbedForm.Tab>
    </TabbedForm>
  </Edit>
);

export default EpisodeEdit;
