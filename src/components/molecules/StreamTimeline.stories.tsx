import type { Meta, StoryObj } from '@storybook/react';
import StreamTimeline from './StreamTimeline';

const meta = {
  title: 'StreamTimeline',
  component: StreamTimeline,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof StreamTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    start: 0,
    end: 100,
    segments: [],
    dataStreams: [],
    onUpdate: () => {},
    onReset: () => {},
  },
};
