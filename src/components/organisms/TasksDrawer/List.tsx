import type { TaskStatus, TaskSummary } from '@/types';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import ProcessingIcon from '@mui/icons-material/Loop';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { blue, green, orange, red } from '@mui/material/colors';
import useTheme from '@mui/material/styles/useTheme';
import { DateTime } from 'luxon';
import { type FC, type JSX, useRef } from 'react';
import { LoadingIndicator } from 'react-admin';
import Notifications from './Notifications';
import useTasks from './useTasks';

const containerStyles = {
  minWidth: 250,
  padding: '2em',
};

const statusIcons: Record<TaskStatus, JSX.Element> = {
  RUNNING: <ProcessingIcon titleAccess="Processing" />,
  SUCCEEDED: <DoneIcon titleAccess="Complete" />,
  FAILED: <ErrorIcon titleAccess="Failed" />,
  ABORTED: <ErrorIcon titleAccess="Aborted" />,
  TIMED_OUT: <ErrorIcon titleAccess="Timed out" />,
};

const statusColors: Record<TaskStatus, string> = {
  RUNNING: orange[500],
  SUCCEEDED: green[500],
  FAILED: red[500],
  ABORTED: blue[500],
  TIMED_OUT: red[500],
};

interface TaskProps {
  task: TaskSummary;
  lastViewedTaskTimestamp: Date;
  markViewed: (id: string) => void;
}

const Task: FC<TaskProps> = ({
  task,

  lastViewedTaskTimestamp,
  markViewed,
}) => {
  const theme = useTheme();

  const timestamp = task.updated_at
    ? DateTime.fromISO(task.updated_at).toLocaleString(DateTime.DATETIME_SHORT)
    : 'unknown';

  const newSinceLastView = new Date(task.updated_at) > lastViewedTaskTimestamp;

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
            {timestamp}
          </Typography>
        }
      />
    </ListItem>
  );
};

const TasksDrawerList = () => {
  const {
    lastViewedTaskTimestamp,
    tasks,
    isLoading,
    markAllViewed,
    markViewed,
    allViewed,
    refetch,
    toggleHidden,
    hiddenTasks,
  } = useTasks();

  const containerRef = useRef<HTMLDivElement>(null);

  const backToTop = () => {
    // Scroll to the top of the list
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Box sx={containerStyles} ref={containerRef}>
      <Typography variant="h6" component="div">
        Tasks
      </Typography>

      {isLoading && <LoadingIndicator />}

      <Typography variant="subtitle1">
        {tasks ? `${tasks.length} tasks` : 'Loading tasks...'}
      </Typography>
      <Button onClick={markAllViewed} disabled={allViewed}>
        Mark all as viewed
      </Button>
      <Button onClick={() => refetch()}>Refresh</Button>
      <Switch checked={hiddenTasks} onChange={toggleHidden} />
      <Typography variant="caption">Hide viewed</Typography>

      <List>
        {tasks.length === 0 && (
          <ListItem>
            <ListItemText primary="No tasks" />
          </ListItem>
        )}
        {tasks.map((task) => (
          <Task
            task={task}
            key={task.id}
            lastViewedTaskTimestamp={lastViewedTaskTimestamp}
            markViewed={markViewed}
          />
        ))}
      </List>

      <Typography variant="subtitle1">
        {tasks ? `${tasks.length} tasks` : 'Loading tasks...'}
      </Typography>

      <Notifications />

      <Button onClick={backToTop}>Back to top</Button>
    </Box>
  );
};

export default TasksDrawerList;
