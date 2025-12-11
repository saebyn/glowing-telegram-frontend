import type { Task } from '@saebyn/glowing-telegram-types';
import { action } from '@storybook/addon-actions';
import TaskView from './TaskView';
export default {
  title: 'Atoms/TaskView',
  component: TaskView,
  tags: ['atoms'],
};

export const Default = {
  args: {
    task: {
      id: '1',
      record_id: '12131-123123-123123-123123',
      status: 'RUNNING',
      created_at: '2021-09-01T12:00:00Z',
      updated_at: '2021-09-01T12:00:00Z',
      task_type: 'rendering',
    } as Task,
    lastViewedTaskTimestamp: new Date('2021-09-01T12:00:00Z'),
    markViewed: action('markViewed'),
  },
};
