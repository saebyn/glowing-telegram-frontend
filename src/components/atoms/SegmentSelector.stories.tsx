import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import SegmentSelector from './SegmentSelector';

const meta = {
  title: 'SegmentSelector',
  component: SegmentSelector,
  tags: ['autodocs'],
  argTypes: {
    boundsStart: { control: 'number' },
    boundsEnd: { control: 'number' },
    segments: { control: 'object' },
    onUpdateSegment: { control: 'object' },
  },
  args: {
    onUpdateSegment: fn(),
  },
} satisfies Meta<typeof SegmentSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    boundsStart: 0,
    boundsEnd: 10,
    segments: [],
  },
};

export const SingleSegment: Story = {
  args: {
    boundsStart: 0,
    boundsEnd: 10,
    segments: [{ id: 1, start: 0, end: 10 }],
  },
};

export const Interacting: Story = {
  args: {
    boundsStart: 0,
    boundsEnd: 10,
    segments: [{ id: 1, start: 1, end: 10 }],
  },
  render: (args) => {
    const [segments, setSegments] = useState(args.segments);

    const onUpdateSegment = (segment: any) => {
      console.log('Segment updated:', segment);

      setSegments((prevSegments) =>
        prevSegments.map((prevSegment) =>
          prevSegment.id === segment.id ? segment : prevSegment,
        ),
      );
    };

    return (
      <SegmentSelector
        {...args}
        segments={segments}
        onUpdateSegment={onUpdateSegment}
      />
    );
  },
};
