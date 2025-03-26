import TaskListView from './TaskListView';
import useTasks from './useTasks';

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

  if (!open) {
    return null;
  }

  return (
    <TaskListView
      isLoading={isLoading}
      tasks={tasks}
      markAllViewed={markAllViewed}
      allViewed={allViewed}
      refetch={refetch}
      hiddenTasks={hiddenTasks}
      toggleHidden={toggleHidden}
      lastViewedTaskTimestamp={lastViewedTaskTimestamp}
      markViewed={markViewed}
    />
  );
};

export default TasksDrawerList;
