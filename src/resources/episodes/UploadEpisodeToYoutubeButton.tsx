import { useState } from 'react';
import { Button, useDataProvider, useListContext } from 'react-admin';

import type { YoutubeUploadTaskPayload } from '@/types';
import MuiButton from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const UploadEpisodeToYoutubeButton = () => {
  const [open, setOpen] = useState(false);
  const [episodes, setEpisodes] = useState<YoutubeUploadTaskPayload[]>([]);
  const { selectedIds } = useListContext();
  const dataProvider = useDataProvider();

  const handleUpload = async () => {
    await dataProvider.createMany('youtube', {
      data: episodes.map((episode) => ({
        id: episode.episode_id,
      })),
    });

    setOpen(false);
  };

  const handleOpen = async () => {
    const { data } = await dataProvider.getMany('episodes', {
      ids: selectedIds,
    });

    setEpisodes(
      data.map((episode: any) => ({
        episode_id: episode.id,
        title: episode.title,
        description: episode.description,
        render_uri: episode.render_uri,
        category: episode.category,
        tags: episode.tags || [],
        notify_subscribers: episode.notify_subscribers,
        task_title: `Upload ${episode.title} to Youtube`,
        recording_date: episode.stream_date,
        playlist_id: episode.playlist_id,
        playlist_position: episode.order_index,
      })),
    );
    setOpen(true);
  };
  const handleClose = () => {
    // Reset the episodes and close the dialog
    setEpisodes([]);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload to Youtube</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to upload the selected episodes to Youtube?
          </DialogContentText>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Can Upload?</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Notify subscribers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {episodes.map((episode) => (
                <EpisodeRow key={episode.title} episode={episode} />
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleClose}>Cancel</MuiButton>
          <MuiButton onClick={handleUpload} color="primary">
            Upload
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Button label="Upload to Youtube" onClick={handleOpen} />
    </>
  );
};

export default UploadEpisodeToYoutubeButton;

const EpisodeRow = ({ episode }: { episode: YoutubeUploadTaskPayload }) => {
  const { title, render_uri, category, tags, notify_subscribers } = episode;

  const tagsString = (tags || []).join(', ');

  return (
    <TableRow>
      <TableCell>{title}</TableCell>
      <TableCell>{render_uri ? 'Yes' : 'No'}</TableCell>
      <TableCell>{category}</TableCell>
      <TableCell>{tagsString}</TableCell>
      <TableCell>{notify_subscribers ? 'Yes' : 'No'}</TableCell>
    </TableRow>
  );
};
