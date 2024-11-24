import { RichTextInput } from 'ra-input-rich-text';
import {
  ArrayInput,
  AutocompleteArrayInput,
  Create,
  DateInput,
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
  const tags: string[] = [];

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

        <AutocompleteArrayInput
          source="tags"
          choices={tags}
          onCreate={(filter?: string) => {
            if (!filter) {
              return;
            }

            tags.push(filter);

            return {
              id: filter,
              value: filter,
            };
          }}
        />

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
    </Create>
  );
}

export default StreamPlansCreate;
