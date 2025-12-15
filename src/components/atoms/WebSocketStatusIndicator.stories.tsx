import type { Meta, StoryObj } from '@storybook/react';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import { WebSocketStatusIndicator } from './WebSocketStatusIndicator';

const meta = {
  title: 'Atoms/WebSocketStatusIndicator',
  component: WebSocketStatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WebSocketStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock WebSocket for Storybook stories
const MockWebsocketWrapper = ({ children }: { children: React.ReactNode }) => {
  // Create a mock WebSocket URL for Storybook
  return (
    <WebsocketProvider url="ws://storybook-mock" token="mock-token">
      {children}
    </WebsocketProvider>
  );
};

export const Connected: Story = {
  render: () => (
    <MockWebsocketWrapper>
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const Connecting: Story = {
  render: () => (
    <MockWebsocketWrapper>
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const Disconnected: Story = {
  render: () => (
    <MockWebsocketWrapper>
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const Reconnecting: Story = {
  render: () => (
    <MockWebsocketWrapper>
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const ErrorStatus: Story = {
  render: () => (
    <MockWebsocketWrapper>
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const WithoutWebSocketProvider: Story = {
  render: () => <WebSocketStatusIndicator />,
  parameters: {
    docs: {
      description: {
        story:
          'When used outside of WebSocketProvider, the component renders nothing.',
      },
    },
  },
};
