import TaskListView from './TaskListView';

import { action } from '@storybook/addon-actions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient();

export default {
  title: 'Organisms/TasksDrawer/TaskListView',
  component: TaskListView,
  tags: ['organisms'],

  decorators: [
    (Story: () => React.ReactNode) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};

export const Default = {
  args: {
    open: true,
    tasks: [
      {
        id: '1',
        created_at: '2023-10-01T10:00:00Z',
        updated_at: null,
        record_id: '123',
        status: 'RUNNING',
        task_type: 'ingestion',
      },
    ],
    lastViewedTaskTimestamp: new Date('2023-09-01T11:00:00Z'),
    isLoading: false,
    markAllViewed: action('markAllViewed'),
    markViewed: action('markViewed'),
    allViewed: false,
    refetch: action('refetch'),
    count: 1,
    toggleHidden: action('toggleHidden'),
    hiddenTasks: false,
  },
};
