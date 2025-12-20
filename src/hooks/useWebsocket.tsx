/**
 * websocket hook and context provider
 */
import type {
  Task,
  Status as TaskStatus,
} from '@saebyn/glowing-telegram-types';
import type { FC, ReactNode } from 'react';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useGetIdentity } from 'react-admin';

import type { WidgetInstance } from '@/types';

export interface TaskStatusWebsocketMessage {
  type: 'TASK_UPDATE';
  task: Task;
  old_status: TaskStatus;
}

export interface WidgetStateUpdateMessage {
  type: 'WIDGET_STATE_UPDATE';
  widgetId: string;
  state: Record<string, unknown>;
  timestamp: string;
}

export interface WidgetInitialStateMessage {
  type: 'WIDGET_INITIAL_STATE';
  widgetId: string;
  widget: WidgetInstance;
}

export interface WidgetActionResponseMessage {
  type: 'WIDGET_ACTION_RESPONSE';
  widgetId: string;
  action: string;
  success: boolean;
  error?: string;
}

export interface WidgetConfigUpdateMessage {
  type: 'WIDGET_CONFIG_UPDATE';
  widgetId: string;
  config: Record<string, unknown>;
}

export type WebsocketMessage =
  | TaskStatusWebsocketMessage
  | WidgetStateUpdateMessage
  | WidgetInitialStateMessage
  | WidgetActionResponseMessage
  | WidgetConfigUpdateMessage;

type Callback = (message: WebsocketMessage) => void;
type SubscriptionHandle = number;

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

const WebsocketContext = createContext<
  | {
      subscribe: (callback: Callback) => SubscriptionHandle;
      unsubscribe: (id: SubscriptionHandle) => void;
      send: (message: object) => void;
      isEmbedMode: boolean;
      status: ConnectionStatus;
    }
  | undefined
>(undefined);
export const useWebsocket = () => useContext(WebsocketContext);

export const WebsocketProvider: FC<{
  children: ReactNode;
  url: string | null;
  token?: string;
}> = ({ url, token: embedToken, children }) => {
  // Connection status state
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // use useRef to keep the websocket instance between renders
  const websocket = useRef<WebSocket | undefined>(undefined);

  const { identity } = useGetIdentity();

  // and then another for keeping track of subscriptions to
  // websocket messages
  const subscriptions = useRef<Map<SubscriptionHandle, Callback>>(new Map());

  // Queue for messages sent before WebSocket is open
  const messageQueue = useRef<object[]>([]);

  // Reconnection state
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectDelay = 30000; // 30 seconds
  const baseReconnectDelay = 1000; // 1 second
  const maxReconnectAttempts = 10; // Cap at 10 attempts to prevent overflow
  const intentionalCloseRef = useRef(false);
  const errorTriggeredReconnectRef = useRef(false); // Prevent double reconnection from error+close

  // provide subscribe and unsubscribe methods to the children
  // Memoize to prevent unnecessary re-renders of consuming components
  const value = useMemo(
    () => ({
      subscribe: (callback: Callback) => {
        let id = Math.random();

        while (subscriptions.current.has(id)) {
          id = Math.random();
        }

        subscriptions.current.set(id, callback);
        return id;
      },
      unsubscribe: (id: SubscriptionHandle) => {
        subscriptions.current.delete(id);
      },
      send: (message: object) => {
        if (websocket.current?.readyState === WebSocket.OPEN) {
          websocket.current.send(JSON.stringify(message));
        } else {
          console.debug('📤 Queueing message until WebSocket opens');
          messageQueue.current.push(message);
        }
      },
      isEmbedMode: !!embedToken,
      status,
    }),
    [embedToken, status],
  );

  useEffect(() => {
    const token = embedToken ?? identity?.idToken;
    const wsUrl = `${url}?token=${token}`;

    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      console.log('🔗 Reusing existing websocket connection');
      return;
    }

    if (!url) {
      console.debug('🚨 No websocket URL provided');
      setStatus('disconnected');
      return;
    }

    // Function to establish WebSocket connection
    const connect = () => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        console.log('🔗 Reusing existing websocket connection');
        return;
      }

      // Clear any existing connection
      if (websocket.current) {
        websocket.current.close();
      }

      setStatus('connecting');

      try {
        websocket.current = new WebSocket(wsUrl);

        websocket.current.addEventListener('open', function (event) {
          console.log('🔗 Connected to websocket', event);
          setStatus('connected');
          reconnectAttempts.current = 0; // Reset reconnect attempts on success
          errorTriggeredReconnectRef.current = false; // Reset error flag on successful connection

          this.send(JSON.stringify({ event: 'subscribe' }));

          // Send any queued messages
          if (messageQueue.current.length > 0) {
            console.log(
              `📤 Sending ${messageQueue.current.length} queued messages`,
            );
            for (const message of messageQueue.current) {
              this.send(JSON.stringify(message));
            }
            messageQueue.current = [];
          }
        });

        websocket.current.addEventListener('message', (event) => {
          console.log('📩 Message from server', event.data);
          const message = JSON.parse(event.data);

          for (const callback of subscriptions.current.values()) {
            callback(message);
          }
        });

        websocket.current.addEventListener('close', (event) => {
          console.log('❌ Disconnected from websocket', event);
          setStatus('disconnected');

          // Only attempt reconnection if close wasn't intentional and not already triggered by error
          if (
            !intentionalCloseRef.current &&
            !errorTriggeredReconnectRef.current
          ) {
            attemptReconnect();
          }
          // Reset the error flag for next connection attempt
          errorTriggeredReconnectRef.current = false;
        });

        websocket.current.addEventListener('error', (event) => {
          console.error('⚠️ WebSocket error', event);
          setStatus('error');
          // Trigger immediate reconnection on error for predictable behavior
          // Set flag to prevent double reconnection when close event fires
          if (!intentionalCloseRef.current) {
            errorTriggeredReconnectRef.current = true;
            attemptReconnect();
          }
        });
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setStatus('error');
        attemptReconnect();
      }
    };

    // Function to attempt reconnection with exponential backoff
    const attemptReconnect = () => {
      if (reconnectTimeoutRef.current) {
        return; // Already attempting reconnection
      }

      reconnectAttempts.current += 1;
      // Cap attempts to prevent overflow in exponential calculation
      const cappedAttempts = Math.min(
        reconnectAttempts.current,
        maxReconnectAttempts,
      );
      const delay = Math.min(
        baseReconnectDelay * 2 ** cappedAttempts,
        maxReconnectDelay,
      );

      console.log(
        `🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts.current})`,
      );
      setStatus('reconnecting');

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connect();
      }, delay) as unknown as number;
    };

    // Initialize connection
    intentionalCloseRef.current = false;
    errorTriggeredReconnectRef.current = false;
    connect();

    return () => {
      console.log('🔌 Closing websocket connection');
      intentionalCloseRef.current = true;

      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Reset reconnect attempts counter to prevent stale values on remount
      reconnectAttempts.current = 0;
      errorTriggeredReconnectRef.current = false;

      websocket.current?.close();
      websocket.current = undefined;
    };
  }, [url, embedToken, identity?.idToken]);

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
};
