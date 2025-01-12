import type { TaskSummary } from '@/types';
import { useGetList, useStore } from 'react-admin';

const useTasks = () => {
  const [hideViewed, setHideViewed] = useStore('hideViewedTasks', false);

  const [rawLastViewedTaskTimestamp, setRawLastViewedTaskTimestamp] = useStore(
    'lastViewedTaskTimestamp',
    '',
  );

  const lastViewedTaskTimestamp = new Date(rawLastViewedTaskTimestamp);

  const setLastViewedTaskTimestamp = (timestamp: Date) => {
    setRawLastViewedTaskTimestamp(timestamp.toISOString());
  };

  const { data: tasks, refetch, isLoading } = useGetList<TaskSummary>('tasks');

  const handleToggleHideViewed = () => {
    setHideViewed((hideViewed) => !hideViewed);
  };

  const handleMarkAllViewed = () => {
    if (tasks && tasks.length > 0) {
      setLastViewedTaskTimestamp(new Date(tasks[0].updated_at));
    }
  };

  const handleMarkViewed = (taskId: string) => {
    if (tasks) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setLastViewedTaskTimestamp(new Date(task.updated_at));
      }
    }
  };

  const allViewed = tasks
    ? tasks.every(
        (task) => new Date(task.updated_at) <= lastViewedTaskTimestamp,
      )
    : false;

  const filteredTasks = (tasks || [])
    .filter((task: TaskSummary) =>
      hideViewed ? new Date(task.updated_at) > lastViewedTaskTimestamp : true,
    )
    /**
     * Sort tasks by updated_at timestamp in descending order.
     * If updated_at is undefined, sort by id in descend
     */
    .sort((a: TaskSummary, b: TaskSummary) => {
      if (a.updated_at === undefined || b.updated_at === undefined) {
        return b.id.localeCompare(a.id);
      }

      if (a.updated_at < b.updated_at) {
        return 1;
      }

      if (a.updated_at > b.updated_at) {
        return -1;
      }

      return 0;
    });

  return {
    lastViewedTaskTimestamp,
    tasks: filteredTasks,
    isLoading,
    markAllViewed: handleMarkAllViewed,
    markViewed: handleMarkViewed,
    allViewed,
    refetch,
    count: filteredTasks.length,
    toggleHidden: handleToggleHideViewed,
    hiddenTasks: hideViewed,
  };
};

export default useTasks;
