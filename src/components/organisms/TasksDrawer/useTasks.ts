import type { Task } from '@saebyn/glowing-telegram-types';
import { DateTime } from 'luxon';
import { useGetList, useStore } from 'react-admin';

const useTasks = () => {
  const [hideViewed, setHideViewed] = useStore('hideViewedTasks', false);

  const [rawLastViewedTaskTimestamp, setRawLastViewedTaskTimestamp] = useStore(
    'lastViewedTaskTimestamp',
    '',
  );

  const lastViewedTaskTimestamp = DateTime.fromISO(rawLastViewedTaskTimestamp);

  const setLastViewedTaskTimestamp = (timestamp: DateTime) => {
    setRawLastViewedTaskTimestamp(timestamp.toISO() || '');
  };

  const { data: tasks, refetch, isLoading } = useGetList<Task>('tasks');

  const handleToggleHideViewed = () => {
    setHideViewed((hideViewed) => !hideViewed);
  };

  const handleMarkAllViewed = () => {
    if (tasks && tasks.length > 0) {
      setLastViewedTaskTimestamp(ts(tasks[0]));
    }
  };

  const handleMarkViewed = (taskId: string) => {
    if (tasks) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setLastViewedTaskTimestamp(ts(task));
      }
    }
  };

  const allViewed = tasks
    ? tasks.every((task) => ts(task) <= lastViewedTaskTimestamp)
    : false;

  const filteredTasks = (tasks || [])
    .filter((task: Task) =>
      hideViewed ? ts(task) > lastViewedTaskTimestamp : true,
    )
    /**
     * Sort tasks by updated_at timestamp in descending order.
     * If updated_at is undefined, sort by id in descend
     */
    .sort((a: Task, b: Task) => {
      const aTimestamp = ts(a);
      const bTimestamp = ts(b);
      return bTimestamp > aTimestamp ? 1 : bTimestamp < aTimestamp ? -1 : 0;
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

function ts(task: Task): DateTime {
  return DateTime.fromISO(task.updated_at ? task.updated_at : task.created_at);
}
