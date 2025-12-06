import type { WidgetInstance } from '@/types';
/**
 * websocket hook and context provider
 */
import type {
  Task,
  Status as TaskStatus,
} from '@saebyn/glowing-telegram-types';
import type { FC, ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef } from 'react';

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

const WebsocketContext = createContext<
  | {
      subscribe: (callback: Callback) => SubscriptionHandle;
      unsubscribe: (id: SubscriptionHandle) => void;
      send: (message: object) => void;
    }
  | undefined
>(undefined);
export const useWebsocket = () => useContext(WebsocketContext);

export const WebsocketProvider: FC<{
  children: ReactNode;
  url: string | null;
  token?: string;
}> = ({ url, token, children }) => {
  // use useRef to keep the websocket instance between renders
  const websocket = useRef<WebSocket | undefined>(undefined);

  // and then another for keeping track of subscriptions to
  // websocket messages
  const subscriptions = useRef<Map<SubscriptionHandle, Callback>>(new Map());

  // provide subscribe and unsubscribe methods to the children
  const value = {
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
        console.warn('⚠️ WebSocket not open, cannot send message');
      }
    },
  };

  useEffect(() => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      console.log('🔗 Reusing existing websocket connection');
      return;
    }

    if (!url) {
      console.debug('🚨 No websocket URL provided');
      return;
    }

    if (websocket.current === undefined) {
      // Add token to URL if provided (for OBS mode)
      const wsUrl = token ? `${url}?token=${token}` : url;

      websocket.current = new WebSocket(wsUrl);
      websocket.current.addEventListener('open', function (event) {
        console.log('🔗 Connected to websocket', event);
        this.send(JSON.stringify({ event: 'subscribe' }));
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
      });

      websocket.current.addEventListener('error', (event) => {
        console.error('⚠️ WebSocket error', event);
      });
    }

    return () => {
      console.log('🔌 Closing websocket connection');
      websocket.current?.close();
    };
  }, [url, token]);

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
};
