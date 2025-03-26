import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import ProcessingIcon from '@mui/icons-material/Loop';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { blue, green, orange, red } from '@mui/material/colors';
import useTheme from '@mui/material/styles/useTheme';
import type { Status, Task } from '@saebyn/glowing-telegram-types';
import { DateTime } from 'luxon';
import type { FC, JSX } from 'react';

const statusIcons: Record<Status, JSX.Element> = {
  RUNNING: <ProcessingIcon titleAccess="Processing" />,
  COMPLETED: <DoneIcon titleAccess="Complete" />,
  FAILED: <ErrorIcon titleAccess="Failed" />,
  ABORTED: <ErrorIcon titleAccess="Aborted" />,
  TIMED_OUT: <ErrorIcon titleAccess="Timed out" />,
  PENDING: <ProcessingIcon titleAccess="Pending" />,
  PENDING_REDRIVE: <ProcessingIcon titleAccess="Pending redrive" />,
};

const statusColors: Record<Status, string> = {
  RUNNING: orange[500],
  COMPLETED: green[500],
  FAILED: red[500],
  ABORTED: blue[500],
  TIMED_OUT: red[500],
  PENDING: blue[200],
  PENDING_REDRIVE: blue[200],
};

interface TaskProps {
  task: Task;
  lastViewedTaskTimestamp: DateTime;
  markViewed: (id: string) => void;
}

const TaskView: FC<TaskProps> = ({
  task,

  lastViewedTaskTimestamp,
  markViewed,
}) => {
  const theme = useTheme();

  const timestamp = DateTime.fromISO(
    task.updated_at ? task.updated_at : task.created_at,
  );

  const formattedTimestamp = timestamp.toLocaleString(DateTime.DATETIME_SHORT);

  const newSinceLastView = timestamp > lastViewedTaskTimestamp;

  return (
    <ListItem
      key={task.id}
      sx={{
        backgroundColor: newSinceLastView ? theme.palette.action.selected : '',
      }}
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="mark viewed"
          onClick={() => markViewed(task.id)}
        >
          <VisibilityIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Badge
          color="secondary"
          variant="dot"
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar
            alt={task.status}
            variant="rounded"
            sx={{ bgcolor: statusColors[task.status] }}
          >
            {statusIcons[task.status]}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={task.id}
        secondary={
          <Typography variant="body2" color="text.primary">
            {formattedTimestamp}
          </Typography>
        }
      />
    </ListItem>
  );
};

export default TaskView;
