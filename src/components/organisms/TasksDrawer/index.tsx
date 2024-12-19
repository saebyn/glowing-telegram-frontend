import { useWebsocket } from '@/hooks/useWebsocket';
import Menu from '@mui/material/Menu';
import { useEffect, useState } from 'react';
import TasksDrawerButton from './Button';
import TasksDrawerList from './List';

const TasksDrawer = () => {
  const [open, setOpen] = useState(false);
  const websocket = useWebsocket();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!websocket) return;

    const handle = websocket.subscribe((task) => {
      if (window.Notification && Notification.permission === 'granted') {
        if (task.event === 'task_status_change') {
          const innerTask = task.task as { id: number };
          new Notification(
            `Task ${innerTask.id} status is now ${task.new_status}`,
          );
        }
      }
    });

    return () => {
      websocket.unsubscribe(handle);
    };
  }, [websocket]);

  return (
    <>
      <TasksDrawerButton onClick={handleOpen} />
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={document.body}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <TasksDrawerList />
      </Menu>
    </>
  );
};

export default TasksDrawer;
