import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
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

// Mock WebSocket class that simulates different connection states
class MockWebSocket {
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(
    public url: string,
    public triggerState: 'connected' | 'connecting' | 'disconnected' | 'error',
  ) {
    this.readyState = triggerState === 'connecting' ? 0 : 1;

    // Simulate connection states after a brief delay
    setTimeout(() => {
      if (triggerState === 'connected' && this.onopen) {
        this.readyState = 1; // OPEN
        this.onopen(new Event('open'));
      } else if (triggerState === 'error' && this.onerror) {
        this.onerror(new Event('error'));
      } else if (triggerState === 'disconnected' && this.onclose) {
        this.readyState = 3; // CLOSED
        this.onclose(
          new CloseEvent('close', { code: 1001, reason: 'Going away' }),
        );
      }
    }, 10);
  }

  send() {}
  close() {}
  addEventListener(type: string, listener: EventListener) {
    if (type === 'open') this.onopen = listener as (event: Event) => void;
    if (type === 'close')
      this.onclose = listener as (event: CloseEvent) => void;
    if (type === 'error') this.onerror = listener as (event: Event) => void;
    if (type === 'message')
      this.onmessage = listener as (event: MessageEvent) => void;
  }
  removeEventListener() {}
}

const MockWebsocketWrapper = ({
  children,
  connectionState,
}: {
  children: ReactNode;
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'error';
}) => {
  // Override global WebSocket temporarily
  useMemo(() => {
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
