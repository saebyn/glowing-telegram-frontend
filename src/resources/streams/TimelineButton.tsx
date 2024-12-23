import TimelineIcon from '@mui/icons-material/Timeline';
import { Button, type ButtonProps, useRecordContext } from 'react-admin';
import { Link } from 'react-router-dom';

function TimelineButton(props: Omit<ButtonProps<typeof Link>, 'to'>) {
  const record = useRecordContext(props);

  if (!record || !record.id) {
    return null;
  }

  return (
    <Button
      component={Link}
      to={{
        pathname: `/streams/${record.id}/timeline`,
      }}
      label="Timeline"
    >
      <TimelineIcon />
    </Button>
  );
}

export default TimelineButton;
