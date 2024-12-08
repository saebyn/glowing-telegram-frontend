import RecurrenceDayInput from '@/atoms/RecurrenceDayInput';
import TagInput from '@/atoms/TagEditorInput';
import TimezoneSelectInput from '@/atoms/TimezoneSelectInput';
import { RichTextInput } from 'ra-input-rich-text';
import {
  ArrayInput,
  DateInput,
  Edit,
  ListButton,
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
  return (
    <Edit actions={<StreamPlansEditActions />}>
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

        <TagInput source="tags" />

        {/* TODO a real category selector */}
        <SelectInput
          source="category"
          choices={[
            {
              id: '1469308723',
              name: 'Software and Game Development',
            },
          ]}
          parse={(value) => {
            return {
              id: value.id,
              name: value.name,
            };
          }}
        />
      </SimpleForm>
    </Edit>
  );
}

export default StreamPlansEdit;
