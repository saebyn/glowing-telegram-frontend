import useSendCutsToProject from '@/hooks/useSendCutsToProject';
import type { Stream } from '@saebyn/glowing-telegram-types';
import type { VideoClip as InputVideoClip } from '@saebyn/glowing-telegram-video-editor';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useGetList } from 'react-admin';

interface ExportOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  clips: InputVideoClip[];
  stream: Stream;
  onCreateEpisodes: (clips: InputVideoClip[]) => void;
}

function ExportOptionsDialog({
  open,
  onClose,
  clips,
  stream,
  onCreateEpisodes,
}: ExportOptionsDialogProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [exportType, setExportType] = useState<'episodes' | 'project'>(
    'episodes',
  );

  const { data: projects, isLoading: isLoadingProjects } = useGetList(
    'projects',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'updated_at', order: 'DESC' },
    },
  );

  const { action: sendCutsToProject, isPending: isSendingCuts } =
    useSendCutsToProject(stream);

  const handleExportTypeChange = (event: SelectChangeEvent) => {
    setExportType(event.target.value as 'episodes' | 'project');
  };

  const handleProjectChange = (event: SelectChangeEvent) => {
    setSelectedProjectId(event.target.value);
  };

  const handleConfirm = () => {
    if (exportType === 'episodes') {
      onCreateEpisodes(clips);
    } else if (exportType === 'project' && selectedProjectId) {
      sendCutsToProject(selectedProjectId, clips);
    }
    onClose();
  };

  const isConfirmDisabled =
    (exportType === 'project' && !selectedProjectId) || isSendingCuts;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Export {clips.length} clip{clips.length !== 1 ? 's' : ''}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Choose how to export your selected clips:
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Export Type</InputLabel>
          <Select
            value={exportType}
            label="Export Type"
            onChange={handleExportTypeChange}
          >
            <MenuItem value="episodes">Create Episodes Directly</MenuItem>
            <MenuItem value="project">Send to Project</MenuItem>
          </Select>
        </FormControl>

        {exportType === 'project' && (
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedProjectId}
              label="Project"
              onChange={handleProjectChange}
              disabled={isLoadingProjects}
            >
              {projects?.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {exportType === 'episodes' && (
          <Typography variant="body2" color="text.secondary">
            Episodes will be created directly from the selected clips.
          </Typography>
        )}

        {exportType === 'project' && selectedProjectId && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Clips will be added to the selected project for later episode
            creation.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isConfirmDisabled}
        >
          {exportType === 'episodes' ? 'Create Episodes' : 'Send to Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExportOptionsDialog;
