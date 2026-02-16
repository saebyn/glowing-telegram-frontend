import type { Meta, StoryObj } from '@storybook/react';
import AdTimerWidget from './AdTimerWidget';

const meta = {
  title: 'Widgets/AdTimerWidget',
  component: AdTimerWidget,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AdTimerWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story showing invisible state (more than 5 minutes away)
export const Invisible: Story = {
  args: {
    widgetId: 'ad-timer-invisible',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Widget is hidden when next ad is more than 5 minutes away or no ad is scheduled.',
      },
    },
  },
};

// Story showing ads incoming state (2-5 minutes away)
export const AdsIncoming: Story = {
  args: {
    widgetId: 'ad-timer-incoming',
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget shows warning when ads are 2-5 minutes away.',
      },
    },
  },
};

// Story showing ads in progress state
export const AdsInProgress: Story = {
  args: {
    widgetId: 'ad-timer-in-progress',
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget pulses red when ads are currently running.',
      },
    },
  },
};

// Story showing back from ads state
export const BackFromAds: Story = {
  args: {
    widgetId: 'ad-timer-back',
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget shows green confirmation after returning from ads.',
      },
    },
  },
};

// Story showing snoozed state
export const AdsSnoozed: Story = {
  args: {
    widgetId: 'ad-timer-snoozed',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Widget shows blue snooze message for 5 seconds after snoozing ads.',
      },
    },
  },
};

// Story showing animation on state change
export const WithAnimation: Story = {
  args: {
    widgetId: 'ad-timer-animated',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Widget scales up briefly when transitioning between states to draw attention.',
      },
    },
  },
};
