import { useWebsocket } from '@/hooks/useWebsocket';
import type { TaskStatusWebsocketMessage } from '@/hooks/useWebsocket';
import ListIcon from '@mui/icons-material/List';
import { Badge, Button } from '@mui/material';
import { type Reducer, useCallback, useEffect, useReducer } from 'react';

interface Props {
  onClick: () => void;
}

interface TasksStatus {
  count: number;
}

type Action = TaskStatusWebsocketMessage | { event: 'reset' };

const TasksDrawerButton = ({ onClick }: Props) => {
  const [tasksStatus, dispatch] = useReducer<Reducer<TasksStatus, Action>>(
    (state, action) => {
      switch (action.event) {
        case 'task_status_change':
          return {
            count: state.count + 1,
          };

        case 'reset':
          return {
            count: 0,
          };

        default:
          return state;
      }
    },
    {
      count: 0,
    },
  );

  const websocket = useWebsocket();

  useEffect(() => {
    if (!websocket) return;

    const handle = websocket.subscribe((task) => {
      dispatch(task);
    });

    return () => {
      websocket.unsubscribe(handle);
    };
  }, [websocket]);

  const handleClick = useCallback(() => {
    dispatch({ event: 'reset' });
    onClick();
  }, [onClick]);

  return (
    <Button color="primary" onClick={handleClick}>
      <Badge badgeContent={tasksStatus.count} color="primary">
        <ListIcon />
      </Badge>
    </Button>
  );
};

export default TasksDrawerButton;
