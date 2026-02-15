import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import type { Task } from '@saebyn/glowing-telegram-types';
import type { DateTime } from 'luxon';
import { useRef } from 'react';
import { LoadingIndicator } from 'react-admin';
import TaskView from '@/components/atoms/TaskView';
import Notifications from './Notifications';

const containerStyles = {
  minWidth: 250,
  padding: '2em',
};

export default function TaskListView({
  isLoading,
  tasks,
  markAllViewed,
  allViewed,
  refetch,
  hiddenTasks,
  toggleHidden,
  lastViewedTaskTimestamp,
  markViewed,
}: {
  isLoading: boolean;
  tasks: Task[];
  markAllViewed: () => void;
  allViewed: boolean;
  refetch: () => void;
  hiddenTasks: boolean;
  toggleHidden: () => void;
  lastViewedTaskTimestamp: DateTime;
  markViewed: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const backToTop = () => {
    // Scroll to the top of the list
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          <TaskView
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
}
