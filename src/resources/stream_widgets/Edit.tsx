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
  useInput,
  useRecordContext,
  useUpdate,
} from 'react-admin';
import { widgetRegistry } from '@/widgets';
import generateAccessToken from './generateAccessToken';

const { VITE_APP_URL: APP_URL = window.location.origin } = import.meta.env;

function CopyWidgetUrlButton() {
  const record = useRecordContext();
  const [copiedOBS, setCopiedOBS] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  if (!record) return null;

  // OBS URL: token auth, no controls, includes widget type for instant skeleton rendering
  const obsUrl = `${APP_URL}/widgets/${record.id}?token=${record.access_token}&type=${record.type}`;

  // Preview URL: token auth, with controls, includes widget type for instant skeleton rendering
  const previewUrl = `${APP_URL}/widgets/${record.id}?token=${record.access_token}&type=${record.type}&controls=true`;

  const handleCopyOBS = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopiedOBS(true);
    setTimeout(() => setCopiedOBS(false), 2000);
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      {/* OBS Browser Source URL */}
      <Typography variant="h6" gutterBottom>
        OBS Browser Source URL
      </Typography>
      <Alert severity="info" sx={{ mb: 1 }}>
        Use this URL in OBS as a Browser Source. No controls will be shown.
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
          mb: 3,
        }}
      >
        <input
          type="text"
          value={obsUrl}
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
          label={copiedOBS ? 'Copied!' : 'Copy'}
          onClick={handleCopyOBS}
          startIcon={<ContentCopyIcon />}
        />
      </Box>

      {/* Preview URL with Controls */}
      <Typography variant="h6" gutterBottom>
        Preview URL (with Controls)
      </Typography>
      <Alert severity="info" sx={{ mb: 1 }}>
        Use this URL to preview and control the widget in a browser. Shows
        start/pause/reset buttons.
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
          value={previewUrl}
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
          label={copiedPreview ? 'Copied!' : 'Copy'}
          onClick={handleCopyPreview}
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

function ColorInput({
  source,
  label,
  placeholder,
}: {
  source: string;
  label: string;
  placeholder?: string;
}) {
  const { field } = useInput({ source });

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
      <TextInput
        source={source}
        label={label}
        placeholder={placeholder}
        fullWidth
      />
      <Box
        component="input"
        type="color"
        value={field.value || '#000000'}
        onChange={(e: any) => {
          field.onChange(e.target.value);
        }}
        sx={{
          width: 60,
          height: 56,
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: 1,
          cursor: 'pointer',
          padding: '4px',
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
          },
        }}
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
          Appearance (for OBS)
        </Typography>
        <BooleanInput
          source="config.showBackground"
          label="Show Background"
          defaultValue={true}
        />
        <ColorInput
          source="config.backgroundColor"
          label="Background Color"
          placeholder="transparent, #000000, rgba(0,0,0,0.5)"
        />
        <ColorInput
          source="config.textColor"
          label="Text Color"
          placeholder="#ffffff, white"
        />
        <NumberInput
          source="config.fontSize"
          label="Timer Font Size (rem)"
          step={0.5}
          min={1}
          max={20}
        />
        <BooleanInput
          source="config.showText"
          label="Show Text Line"
          defaultValue={true}
        />
        <BooleanInput
          source="config.showTitle"
          label="Show Title"
          defaultValue={true}
        />
        <BooleanInput
          source="config.showProgressBar"
          label="Show Progress Bar"
          defaultValue={true}
        />
        <BooleanInput
          source="config.showOriginalDuration"
          label="Show Original Duration"
          defaultValue={true}
        />

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
