import { TextInput, TimeInput } from 'react-admin';

const streamActionFilters = [
  <TextInput key="q" label="Search" source="q" alwaysOn />,
  <TimeInput
    key="start_time"
    label="Start Time"
    source="start_time"
    parse={(value) => value}
  />,
];

export default streamActionFilters;
