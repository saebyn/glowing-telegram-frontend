import TagInput from '@/atoms/TagEditorInput';
import TimezoneSelectInput from '@/atoms/TimezoneSelectInput';
import TwitchCategoryAutocompleteInput from '@/atoms/TwitchCategoryAutocompleteInput';
import useProfile from '@/useProfile';
import Alert from '@mui/material/Alert';
import { RichTextInput } from 'ra-input-rich-text';
import {
  ArrayInput,
  Create,
  DateInput,
  LoadingIndicator,
  NumberInput,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  TimeInput,
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

function StreamPlansCreate() {
  const { profile, status } = useProfile();

  if (status === 'pending') {
    return <LoadingIndicator />;
  }

  if (status === 'error') {
    return <Alert severity="error">Failed to load profile</Alert>;
  }

  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput source="description" />
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

        <SelectArrayInput
          source="recurrence.days"
          choices={[
            { id: 'sunday', name: 'Sunday' },
            { id: 'monday', name: 'Monday' },
            { id: 'tuesday', name: 'Tuesday' },
            { id: 'wednesday', name: 'Wednesday' },
            { id: 'thursday', name: 'Thursday' },
            { id: 'friday', name: 'Friday' },
            { id: 'saturday', name: 'Saturday' },
          ]}
          validate={required()}
        />

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

        <TagInput source="tags" />

        <TwitchCategoryAutocompleteInput source="category" profile={profile} />
      </SimpleForm>
    </Create>
  );
}

export default StreamPlansCreate;
