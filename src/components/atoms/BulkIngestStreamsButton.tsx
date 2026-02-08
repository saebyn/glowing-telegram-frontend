/**
 * BulkIngestStreamsButton
 *
 * This component is a bulk action button that allows the user to ingest videos
 * from multiple selected streams at once.
 *
 * Requirements:
 * - Works on selected streams from the list page
 * - Does NOT allow editing initial prompt/summary (uses defaults)
 * - Shows confirmation dialog with list of streams to be ingested
 * - Shows progress and results after ingestion
 */

import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import IngestVideoIcon from '@mui/icons-material/VideoLibrary';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Stream } from '@saebyn/glowing-telegram-types';
import { useState } from 'react';
import {
  Button,
  LoadingIndicator,
  useDataProvider,
  useListContext,
  useNotify,
  useRefresh,
  useTranslate,
  useUnselectAll,
} from 'react-admin';
import {
  applyTemplate,
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_SUMMARY_TEMPLATE,
} from '@/constants/ingestTemplates';

// This is the initial prompt template that will be used for each stream
function getInitialPromptTemplate(record: Stream): string {
  return applyTemplate(DEFAULT_PROMPT_TEMPLATE, record);
}

// This is the initial summary template that will be used for each stream
function getInitialSummaryTemplate(record: Stream): string {
  return applyTemplate(DEFAULT_SUMMARY_TEMPLATE, record);
}

interface StreamIngestStatus {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

const BulkIngestStreamsButton = () => {
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll('streams');
  const { selectedIds, data } = useListContext<Stream>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState<StreamIngestStatus[]>([]);

  const handleOpen = async () => {
    if (!selectedIds.length) {
      notify('Please select at least one stream', { type: 'warning' });
      return;
    }

    if (data === undefined) {
      return;
    }

    // Get the selected records
    const selectedRecords = data.filter((record) =>
      selectedIds.includes(record.id),
    );

    // Check if all streams have a prefix
    const streamsWithoutPrefix = selectedRecords.filter(
      (record) => !record.prefix,
    );
    if (streamsWithoutPrefix.length > 0) {
      notify(
        `${streamsWithoutPrefix.length} stream(s) are missing a prefix and cannot be ingested`,
        { type: 'error' },
      );
      return;
    }

    setStreams(
      selectedRecords.map((record) => ({
        id: record.id,
        title: record.title || 'Untitled Stream',
        status: 'pending' as const,
      })),
    );
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) {
      setStreams([]);
      setOpen(false);
    }
  };

  const handleProceed = async () => {
    if (data === undefined) {
      return;
    }

    setLoading(true);

    try {
      const selectedRecords = data.filter((record) =>
        selectedIds.includes(record.id),
      );

      // Process each stream sequentially
      for (const record of selectedRecords) {
        // Update status to processing
        setStreams((prev) =>
          prev.map((s) =>
            s.id === record.id ? { ...s, status: 'processing' } : s,
          ),
        );

        try {
          await dataProvider.create('streamIngest', {
            data: {
              streamId: record.id,
              initialPrompt: getInitialPromptTemplate(record),
              initialSummary: getInitialSummaryTemplate(record),
            },
          });

          // Update status to success
          setStreams((prev) =>
            prev.map((s) =>
              s.id === record.id ? { ...s, status: 'success' } : s,
            ),
          );
        } catch (err: unknown) {
          let message = 'Unknown error';
          if (err instanceof Error) {
            message = err.message;
          }

          // Update status to error
          setStreams((prev) =>
            prev.map((s) =>
              s.id === record.id
                ? { ...s, status: 'error', error: message }
                : s,
            ),
          );
        }
      }

      notify('Bulk ingestion completed', { type: 'info' });
      unselectAll();
      refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        label={translate('gt.bulk_ingest_streams', {
          _: 'Bulk Ingest Videos',
        })}
      >
        <IngestVideoIcon />
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {translate('gt.bulk_ingest_streams', { _: 'Bulk Ingest Videos' })}
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Alert severity="info">
              <LoadingIndicator />
              Processing streams...
            </Alert>
          )}

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {streams.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell>{stream.title}</TableCell>
                  <TableCell>
                    {stream.status === 'pending' && 'Pending'}
                    {stream.status === 'processing' && (
                      <>
                        <LoadingIndicator /> Processing...
                      </>
                    )}
                    {stream.status === 'success' && 'Success'}
                    {stream.status === 'error' && <>Error: {stream.error}</>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          {!loading && streams.every((s) => s.status === 'pending') && (
            <>
              <Button
                onClick={handleClose}
                label={translate('ra.action.cancel', { _: 'Cancel' })}
              >
                <CloseIcon />
              </Button>
              <Button
                onClick={handleProceed}
                label={translate('ra.action.send', { _: 'Proceed' })}
              >
                <SendIcon />
              </Button>
            </>
          )}
          {!loading && !streams.every((s) => s.status === 'pending') && (
            <Button
              onClick={handleClose}
              label={translate('ra.action.close', { _: 'Close' })}
            >
              <CloseIcon />
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkIngestStreamsButton;
