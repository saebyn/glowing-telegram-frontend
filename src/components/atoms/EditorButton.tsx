import VideoFileIcon from '@mui/icons-material/VideoFile';
import { Button, type ButtonProps, useRecordContext } from 'react-admin';
import { Link } from 'react-router-dom';

function EditorButton(props: Omit<ButtonProps<typeof Link>, 'to'>) {
  const record = useRecordContext(props);

  if (!record || !record.id) {
    return null;
  }

  return (
    <Button
      component={Link}
      to={{
        pathname: `/streams/${record.id}/editor`,
      }}
      label="Editor"
    >
      <VideoFileIcon />
    </Button>
  );
}

export default EditorButton;
