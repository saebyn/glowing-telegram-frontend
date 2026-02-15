/**
 * Mock WebSocket wrapper utilities for Storybook stories
 * Provides reusable components for mocking WebSocket connections in tests and stories
 */
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import type { WebsocketMessage } from '@/hooks/useWebsocket';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import { MockWebSocket } from './MockWebSocket';

interface MockWebsocketWrapperProps {
  children: ReactNode;
  connectionState?: 'connected' | 'connecting' | 'disconnected' | 'error';
  messages?: WebsocketMessage[];
  url?: string;
  token?: string;
}

/**
 * MockWebsocketWrapper - Wraps components with a mocked WebSocket connection
 *
 * @param connectionState - Initial connection state (default: 'connected')
 * @param messages - Array of messages to send after connection (sent after 100ms delay)
 * @param url - WebSocket URL (default: 'ws://storybook-mock')
 * @param token - Auth token (default: 'mock-token')
 */
export const MockWebsocketWrapper = ({
  children,
  connectionState = 'connected',
  messages = [],
  url = 'ws://storybook-mock',
  token = 'mock-token',
}: MockWebsocketWrapperProps) => {
  const mockWebSocketRef = useRef<MockWebSocket | null>(null);

  useEffect(() => {
    const originalWebSocket = global.WebSocket;
    // @ts-expect-error - Mocking WebSocket for testing
    global.WebSocket = class extends MockWebSocket {
      constructor(wsUrl: string) {
        super(wsUrl, connectionState);
        mockWebSocketRef.current = this;

        // Send messages after connection
        if (messages.length > 0 && connectionState === 'connected') {
          setTimeout(() => {
            for (const message of messages) {
              this.simulateMessage(message);
            }
          }, 100);
        }
      }
    };

    return () => {
      global.WebSocket = originalWebSocket;
    };
  }, [connectionState, messages]);

  return (
    <WebsocketProvider url={url} token={token}>
      {children}
    </WebsocketProvider>
  );
};
