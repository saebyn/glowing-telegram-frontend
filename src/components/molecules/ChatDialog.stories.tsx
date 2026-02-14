import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ChatDialog from './ChatDialog';

const meta = {
  title: 'ChatDialog',
  component: ChatDialog,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    onChat: {},
    onChange: {},
    job: { control: 'text' },
    transcript: { control: 'text' },
    context: { control: 'text' },
  },
  args: {
    open: true,
    job: '',
    transcript: '',
    context: '',
    onChat: fn((msgs) => Promise.resolve(msgs)),
    onChange: fn(),
  },
} satisfies Meta<typeof ChatDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {} as Story;

export const WithMessages: Story = {
  args: {
    job: 'Job title',
    transcript: 'Transcript',
    context: 'Context',
    onChat: fn(async (msgs) => {
      return [
        ...msgs,
        {
          content: 'Assistant message',
          role: 'assistant' as const,
        },
      ];
    }),
  },
} as Story;
