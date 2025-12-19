import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  DateField,
  Show,
  SimpleShowLayout,
  TextField,
  useRecordContext,
} from 'react-admin';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import CountdownTimerWidget from '@/widgets/CountdownTimerWidget';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

function WidgetPreview() {
  const record = useRecordContext();

  if (!record) return null;

  // Only show preview for countdown timer widgets
  if (record.type !== 'countdown') {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Live preview is only available for countdown timer widgets.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Live Preview
      </Typography>
      <Card
        sx={{
          backgroundColor: '#000',
          border: '2px solid #333',
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: 400,
        }}
      >
        <WebsocketProvider url={WEBSOCKET_URL}>
          <CountdownTimerWidget widgetId={String(record.id)} />
        </WebsocketProvider>
      </Card>
    </Box>
  );
}

function WidgetShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="type" />
        <TextField source="stream_id" label="Stream" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />

        <WidgetPreview />
      </SimpleShowLayout>
    </Show>
  );
}

export default WidgetShow;
