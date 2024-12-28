/**
 * IngestStreamVideosButton
 *
 * This component is a button that allows the user to ingest videos from a stream.
 *
 * Requirments:
 * - When the user clicks the button, a dialog will open that allows the user to
 *   - verify the stream prefix (or warn the user if the stream prefix is
 *     missing and disable proceeding),
 *   - provide the initial context for the video ingest process (e.g. title,
 *     description, etc.), which will be automatically populated from
 *     the stream data,
 *   - click a button to start the ingest process.
 *   - click a button to cancel the ingest process.
 * - The dialog should be a modal dialog that is centered on the screen.
 * - The dialog should be dismissable by clicking outside the dialog or by
 *   pressing the escape key.
 * - The dialog should be styled to match the design of the application.
 * - The dialog should be responsive to the size of the screen.
 * - The dialog should be accessible to screen readers.
 * - The dialog should be internationalized.
 * - The dialog should show a loading spinner when the ingest process is in
 *   progress.
 * - The dialog should show a success message when the ingest process is
 *   complete.
 * - The dialog should show an error message when the ingest process fails.
 * - The proceed button should be disabled until the stream prefix is verified.
 * - The proceed button should be removed when the ingest process is in progress or complete.
 */

import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import IngestVideoIcon from '@mui/icons-material/VideoLibrary';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Stream } from 'glowing-telegram-types/src/types';
import { DateTime, Duration } from 'luxon';
import React, { useEffect } from 'react';
import {
  Button,
  LoadingIndicator,
  useDataProvider,
  useRecordContext,
  useTranslate,
} from 'react-admin';

// This is the initial prompt template that will be shown to the user when they
// open the dialog. This template will be populated with data from the stream
// record.
function getInitialPromptTemplate(record: Stream): string {
  if (!record.stream_date) {
    return 'No stream date available.';
  }

  const date = DateTime.fromISO(record.stream_date).toLocaleString();

  return `
  Welcome to the start of the stream titled "${record.title}" on ${date}. This text will be used as initial context for the transcription process.
  `;
}

// This is the initial summary template that will be shown to the user when they
// open the dialog. This template will be populated with data from the stream
// record.
function getInitialSummaryTemplate(record: Stream): string {
  if (!record.stream_date) {
    return 'No stream date available.';
  }

  const date = DateTime.fromISO(record.stream_date).toLocaleString();
  // convert duration to human readable format from seconds
  const duration = Duration.fromObject({ seconds: record.duration }).toFormat(
    "hh 'hours,' mm 'minutes,' ss 'seconds'",
  );

  return `
  The stream on ${date} was streamed on ${record.stream_platform}.
  It has a duration of ${duration}. The description is as follows:
  ${record.description}

  It was titled "${record.title}".

  This information relates to the stream and will be used as initial context for the summarization process, which summarizes the transcription of the stream.
  `;
}

const IngestStreamVideosButton = () => {
  const translate = useTranslate();
  const record = useRecordContext<Stream>();
  const dataProvider = useDataProvider();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [initialPrompt, setInitialPrompt] = React.useState('');
  const [initialSummary, setInitialSummary] = React.useState('');

  useEffect(() => {
    if (record) {
      setInitialPrompt(getInitialPromptTemplate(record));
      setInitialSummary(getInitialSummaryTemplate(record));
    }
  }, [record]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleProceed = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await dataProvider.create('streamIngest', {
        data: {
          streamId: record?.id,
          initialPrompt,
          initialSummary,
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        label={translate('gt.ingest_stream_videos', { _: 'Ingest Videos' })}
      >
        <IngestVideoIcon />
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {translate('gt.ingest_stream_videos', { _: 'Ingest Videos' })}
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Alert severity="info">
              <LoadingIndicator />
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Success!</Alert>}

          <Typography variant="h6">
            {translate('gt.verify_stream_prefix', {
              _: 'Verify Stream Prefix',
            })}
          </Typography>
          <Typography>
            {translate('gt.verify_stream_prefix_description', {
              _: 'The stream prefix is used to identify related video clips for this stream. It is typically in the format YYYY-MM-DD.',
            })}
          </Typography>
          <TextField
            label={translate('gt.stream_prefix', { _: 'Stream Prefix' })}
            value={`${record?.prefix || ''}/`}
            disabled
            fullWidth
          />

          <TextField
            label={translate('gt.initial_prompt', { _: 'Initial Prompt' })}
            value={initialPrompt}
            onChange={(e) => setInitialPrompt(e.target.value)}
            fullWidth
            multiline
          />
          <TextField
            label={translate('gt.initial_summary', { _: 'Initial Summary' })}
            value={initialSummary}
            onChange={(e) => setInitialSummary(e.target.value)}
            fullWidth
            multiline
          />
        </DialogContent>
        <DialogActions>
          {!success && (
            <Button
              onClick={handleClose}
              label={translate('ra.action.cancel', { _: 'Cancel' })}
            >
              <CloseIcon />
            </Button>
          )}
          {success && (
            <Button
              onClick={handleClose}
              label={translate('ra.action.close', { _: 'Close' })}
            >
              <CloseIcon />
            </Button>
          )}
          {!loading && !success && (
            <Button
              onClick={handleProceed}
              label={translate('ra.action.send', { _: 'Proceed' })}
              disabled={loading}
            >
              <SendIcon />
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IngestStreamVideosButton;
