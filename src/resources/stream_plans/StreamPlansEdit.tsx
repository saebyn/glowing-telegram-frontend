import RecurrenceDayInput from '@/components/atoms/RecurrenceDayInput';
import TagInput from '@/components/atoms/TagEditorInput';
import TimezoneSelectInput from '@/components/atoms/TimezoneSelectInput';
import TwitchCategoryAutocompleteInput from '@/components/atoms/TwitchCategoryAutocompleteInput';
import YouTubeCategoryInput from '@/components/atoms/YouTubeCategoryInput';
import useProfile from '@/hooks/useProfile';
import Alert from '@mui/material/Alert';
import { Suspense, lazy } from 'react';
const RichTextInput = lazy(async () => {
  const module = await import('ra-input-rich-text');
  return { default: module.RichTextInput };
});
import {
  ArrayInput,
  BooleanInput,
  DateInput,
  Edit,
  ListButton,
  LoadingIndicator,
  NumberInput,
  SelectInput,
  SimpleFormIterator,
  TabbedForm,
  TextInput,
  TimeInput,
  TopToolbar,
  required,
} from 'react-admin';

const startDateValidation = [
  required(),
  (value: Date) => {
    if (value && value < new Date()) {
      return 'Start date must be in the future';
    }
  },
];

function StreamPlansEditActions() {
  return (
    <TopToolbar>
      <ListButton />
    </TopToolbar>
  );
}

function StreamPlansEdit() {
  const { profile, status } = useProfile();

  if (status === 'pending') {
    return <LoadingIndicator />;
  }

  if (status === 'error') {
    return <Alert severity="error">Failed to load profile</Alert>;
  }

  return (
    <Edit actions={<StreamPlansEditActions />}>
      <TabbedForm>
        <TabbedForm.Tab label="General">
          <TextInput source="title" validate={required()} />
          <TextInput source="description" />
          <BooleanInput source="is_active" />

          <TagInput source="tags" maxTags={10} />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Stream Details">
          <TextInput
            source="stream_title_template"
            validate={required()}
            helperText="Template for the title of the stream. Use ${title} to insert the series title and ${stream_count} to insert the stream number"
          />
          <NumberInput
            source="stream_count"
            helperText="Number of streams that have been done for this series"
            validate={required()}
            defaultValue={0}
          />

          <Suspense fallback={<LoadingIndicator />}>
            <RichTextInput source="prep_notes" />
          </Suspense>

          <DateInput
            source="start_date"
            validate={startDateValidation}
            defaultValue={new Date()}
          />
          <DateInput source="end_date" />

          <ArrayInput source="skips">
            <SimpleFormIterator inline>
              <DateInput source="date" />
              <TextInput source="reason" />
            </SimpleFormIterator>
          </ArrayInput>

          <SelectInput
            source="recurrence.type"
            choices={[
              { id: 'daily', name: 'Daily' },
              { id: 'weekly', name: 'Weekly' },
              { id: 'monthly', name: 'Monthly' },
            ]}
            defaultValue={'weekly'}
          />

          <RecurrenceDayInput source="recurrence.days" validate={required()} />

          <NumberInput
            source="recurrence.interval"
            defaultValue={1}
            validate={required()}
          />

          <TimezoneSelectInput source="timezone" validate={required()} />

          <TimeInput
            source="start_time"
            validate={required()}
            parse={(value) => value}
          />
          <TimeInput
            source="end_time"
            validate={required()}
            parse={(value) => value}
          />

          <TwitchCategoryAutocompleteInput
            source="twitch_category"
            profile={profile}
          />
        </TabbedForm.Tab>

        <TabbedForm.Tab label="Episode Planning">
          <NumberInput
            source="max_episode_order_index"
            helperText="The maximum episode order index for this series. This is used to generate the episode order index for new episodes. This value should match the highest episode order index for the series."
            validate={required()}
            defaultValue={0}
          />

          <TextInput source="thumbnail_url" />
          <TextInput source="playlist_id" />

          <BooleanInput source="notify_subscribers" />

          <YouTubeCategoryInput source="category" />

          <TextInput
            source="episode_title_template"
            helperText="Template for the title of the episode. Use ${title} to insert the series title, ${episode_order_index} to insert the episode order index, ${stream_title} to insert the stream title, ${stream_description} to insert the stream description, and ${stream_count} to insert the stream count"
          />

          <TextInput
            source="episode_description_template"
            multiline={true}
            rows={5}
            helperText="Template for the description of the episode. Use ${title} to insert the series title, ${episode_order_index} to insert the episode order index, ${stream_title} to insert the stream title, ${stream_description} to insert the stream description, and ${stream_count} to insert the stream count"
          />
        </TabbedForm.Tab>
      </TabbedForm>
    </Edit>
  );
}

export default StreamPlansEdit;
