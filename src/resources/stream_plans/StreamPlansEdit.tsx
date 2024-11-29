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
import RecurrenceDayInput from '../../atoms/RecurrenceDayInput';
import TagInput from '../../atoms/TagEditorInput';

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

        {/* TODO need a timezone picker */}
        <SelectInput
          source="timezone"
          validate={required()}
          choices={[{ id: 'America/Los_Angeles', name: 'Pacific Time' }]}
        />

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

        <SelectInput
          source="category"
          choices={[
            {
              id: 'Software and Game Development',
              name: 'Software and Game Development',
            },
          ]}
        />
      </SimpleForm>
    </Edit>
  );
}

export default StreamPlansEdit;
