import RecurrenceDayInput from '@/components/atoms/RecurrenceDayInput';
import TagInput from '@/components/atoms/TagEditorInput';
import TimezoneSelectInput from '@/components/atoms/TimezoneSelectInput';
import TwitchCategoryAutocompleteInput from '@/components/atoms/TwitchCategoryAutocompleteInput';
import YouTubeCategoryInput from '@/components/atoms/YouTubeCategoryInput';
import useProfile from '@/hooks/useProfile';
import Alert from '@mui/material/Alert';
import { RichTextInput } from 'ra-input-rich-text';
import {
  ArrayInput,
  BooleanInput,
  DateInput,
  Edit,
  ListButton,
  LoadingIndicator,
  NumberInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
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
      <SimpleForm>
        <TextInput source="title" validate={required()} />
        <TextInput source="description" />
        <BooleanInput source="is_active" />

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

        <RichTextInput source="prep_notes" />

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

        <TagInput source="tags" maxTags={10} />

        <YouTubeCategoryInput source="category" />

        <TwitchCategoryAutocompleteInput
          source="twitch_category"
          profile={profile}
        />

        <TextInput source="thumbnail_url" />
        <TextInput source="playlist_id" />

        <BooleanInput source="notify_subscribers" />
      </SimpleForm>
    </Edit>
  );
}

export default StreamPlansEdit;
