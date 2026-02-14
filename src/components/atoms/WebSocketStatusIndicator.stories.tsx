import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import { MockWebSocket } from '@/mocks/MockWebSocket';
import { WebSocketStatusIndicator } from './WebSocketStatusIndicator';

const queryClient = new QueryClient();

const meta = {
  title: 'Atoms/WebSocketStatusIndicator',
  component: WebSocketStatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof WebSocketStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const MockWebsocketWrapper = ({
  children,
  connectionState,
}: {
  children: ReactNode;
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'error';
}) => {
  // Override global WebSocket temporarily
  useEffect(() => {
    const originalWebSocket = global.WebSocket;
    // @ts-expect-error - Mocking WebSocket for testing
    global.WebSocket = class extends MockWebSocket {
      constructor(url: string) {
        super(url, connectionState);
      }
    };
    return () => {
      global.WebSocket = originalWebSocket;
    };
  }, [connectionState]);

  return (
    <WebsocketProvider url="ws://storybook-mock" token="mock-token">
      {children}
    </WebsocketProvider>
  );
};

export const Connected: Story = {
  render: () => (
    <MockWebsocketWrapper connectionState="connected">
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const Connecting: Story = {
  render: () => (
    <MockWebsocketWrapper connectionState="connecting">
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const Disconnected: Story = {
  render: () => (
    <MockWebsocketWrapper connectionState="disconnected">
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
};

export const Reconnecting: Story = {
  render: () => (
    <MockWebsocketWrapper connectionState="disconnected">
      <WebSocketStatusIndicator />
    </MockWebsocketWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows reconnecting state after a disconnection. The status will automatically transition to "Reconnecting..." after disconnect.',
      },
    },
  },
};

export const ErrorStatus: Story = {
  render: () => (
    <MockWebsocketWrapper connectionState="error">
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
