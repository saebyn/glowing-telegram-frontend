import { NullableBooleanInput, TextInput, TimeInput } from 'react-admin';

const streamActionFilters = [
  <TextInput key="q" label="Search" source="q" alwaysOn />,
  <TimeInput
    key="start_time"
    label="Start Time"
    source="start_time"
    parse={(value) => value}
  />,
  <NullableBooleanInput key="is_active" label="Active" source="is_active" />,
];

export default streamActionFilters;
