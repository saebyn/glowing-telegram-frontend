import {
  BooleanInput,
  Create,
  type CreateProps,
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import { widgetRegistry } from '@/widgets';

const WidgetCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} fullWidth />
      <SelectInput
        source="type"
        choices={widgetRegistry.getChoices()}
        validate={[required()]}
      />
      <BooleanInput source="active" defaultValue={true} />

      {/* Countdown Timer Configuration */}
      <TextInput
        source="config.text"
        label="Timer Text"
        helperText="For countdown timer widgets"
      />
      <TextInput
        source="config.title"
        label="Timer Title"
        helperText="For countdown timer widgets"
      />
      <NumberInput
        source="config.duration"
        label="Duration (seconds)"
        helperText="For countdown timer widgets"
        defaultValue={300}
      />

      {/* Initial State */}
      <NumberInput
        source="state.durationLeft"
        label="Duration Left (seconds)"
        helperText="Initial time remaining"
      />
      <BooleanInput
        source="state.enabled"
        label="Timer Enabled"
        defaultValue={false}
      />
    </SimpleForm>
  </Create>
);

export default WidgetCreate;
