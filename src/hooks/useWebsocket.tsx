/**
 * websocket hook and context provider
 */

import type {
  Task,
  Status as TaskStatus,
} from '@saebyn/glowing-telegram-types';
import type { FC, ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef } from 'react';

type Callback = (message: TaskStatusWebsocketMessage) => void;
type SubscriptionHandle = number;

const WebsocketContext = createContext<
  | {
      subscribe: (callback: Callback) => SubscriptionHandle;
      unsubscribe: (id: SubscriptionHandle) => void;
    }
  | undefined
>(undefined);
export const useWebsocket = () => useContext(WebsocketContext);

export interface TaskStatusWebsocketMessage {
  task: Task;
  previous_status: TaskStatus;
  new_status: TaskStatus;
  event: 'task_status_change';
}

export const WebsocketProvider: FC<{
  children: ReactNode;
  url: string;
}> = ({ url, children }) => {
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
      websocket.current = new WebSocket(url);
      websocket.current.addEventListener('open', function (event) {
        console.log('🔗 Connected to tasks websocket', event);
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
        console.log('❌ Disconnected from tasks websocket', event);
      });

      websocket.current.addEventListener('error', (event) => {
        console.error('⚠️ WebSocket error', event);
      });
    }

    return () => {
      console.log('🔌 Closing websocket connection');
      websocket.current?.close();
    };
  }, [url]);

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
};
