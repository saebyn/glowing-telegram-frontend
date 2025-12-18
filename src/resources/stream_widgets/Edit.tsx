import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Box, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useState } from 'react';
import {
  BooleanInput,
  Button,
  Edit,
  type EditProps,
  NumberInput,
  required,
  SaveButton,
  SelectInput,
  SimpleForm,
  TextInput,
  Toolbar,
  useRecordContext,
  useUpdate,
} from 'react-admin';
import { widgetRegistry } from '@/widgets';
import generateAccessToken from './generateAccessToken';

const { VITE_APP_URL: APP_URL = window.location.origin } = import.meta.env;

function CopyWidgetUrlButton() {
  const record = useRecordContext();
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const widgetUrl = `${APP_URL}/widgets/${record.id}?token=${record.access_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        OBS Browser Source URL
      </Typography>
      <Alert severity="info" sx={{ mb: 1 }}>
        Use this URL in OBS as a Browser Source to display the widget on your
        stream
      </Alert>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <input
          type="text"
          value={widgetUrl}
          readOnly
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        />
        <Button
          label={copied ? 'Copied!' : 'Copy'}
          onClick={handleCopy}
          startIcon={<ContentCopyIcon />}
        />
      </Box>
    </Box>
  );
}

function RegenerateTokenButton() {
  const record = useRecordContext();
  const [update, { isPending }] = useUpdate();

  if (!record) return null;

  const handleRegenerate = () => {
    const newToken = generateAccessToken();

    update('stream_widgets', {
      id: record.id,
      data: { access_token: newToken },
      previousData: record,
    });
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        If your widget URL has been compromised, you can regenerate the access
        token. This will invalidate the old URL.
      </Typography>
      {isPending && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Regenerating access token...
        </Alert>
      )}
      <Button
        label="Regenerate Token"
        onClick={handleRegenerate}
        startIcon={<RefreshIcon />}
        disabled={isPending}
        color="warning"
      />
    </Box>
  );
}

const WidgetEditToolbar = (props: any) => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

const WidgetEdit = (props: EditProps) => {
  // Transform function to update last_tick_timestamp when duration_left changes
  const transform = (data: any) => {
    // If duration_left is being set, update last_tick_timestamp to current time
    if (data.state?.duration_left !== undefined) {
      return {
        ...data,
        state: {
          ...data.state,
          last_tick_timestamp: DateTime.now().toISO(),
        },
      };
    }
    return data;
  };

  return (
    <Edit {...props} transform={transform}>
      <SimpleForm toolbar={<WidgetEditToolbar />}>
        <TextInput source="title" validate={[required()]} fullWidth />
        <SelectInput
          source="type"
          choices={widgetRegistry.getChoices()}
          validate={[required()]}
          disabled
        />
        <BooleanInput source="active" />

        <CopyWidgetUrlButton />
        <TextInput source="access_token" label="Access Token" readOnly={true} />
        <RegenerateTokenButton />

        {/* Countdown Timer Configuration */}
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Configuration
        </Typography>
        <TextInput source="config.text" label="Timer Text" fullWidth />
        <TextInput source="config.title" label="Timer Title" fullWidth />
        <NumberInput source="config.duration" label="Duration (seconds)" />

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Current State
        </Typography>
        <NumberInput
          source="state.duration_left"
          label="Duration Left (seconds)"
        />
        <BooleanInput source="state.enabled" label="Timer Enabled" />
      </SimpleForm>
    </Edit>
  );
};

export default WidgetEdit;
