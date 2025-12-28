import { useState } from 'react';
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
import generateAccessToken from './generateAccessToken';

const WidgetCreate = (props: CreateProps) => {
  const [generatedAccessToken] = useState(generateAccessToken);

  return (
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
        <NumberInput
          source="config.width"
          label="Widget Width (pixels)"
          helperText="Optional: Set a fixed width for consistent sizing across states"
          min={100}
          max={3840}
        />
        <NumberInput
          source="config.height"
          label="Widget Height (pixels)"
          helperText="Optional: Set a fixed height for consistent sizing across states"
          min={100}
          max={2160}
        />

        {/* Initial State */}
        <NumberInput
          source="state.duration_left"
          label="Duration Left (seconds)"
          helperText="Initial time remaining"
        />
        <BooleanInput
          source="state.enabled"
          label="Timer Enabled"
          defaultValue={false}
        />

        <TextInput
          source="access_token"
          label="Access Token"
          readOnly={true}
          defaultValue={generatedAccessToken}
        />
      </SimpleForm>
    </Create>
  );
};

export default WidgetCreate;
