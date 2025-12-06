import { useEffect, useState } from 'react';
import type { WidgetInstance } from '@/types';
import { useWebsocket } from './useWebsocket';

export function useWidgetSubscription(widgetId: string) {
  const websocket = useWebsocket();
  const [widget, setWidget] = useState<WidgetInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!websocket) {
      console.warn('useWidgetSubscription used outside WebsocketProvider');
      return;
    }

    // Subscribe to widget updates
    websocket.send({
      type: 'WIDGET_SUBSCRIBE',
      widgetId,
    });

    // Listen for widget messages
    const handleId = websocket.subscribe((message) => {
      switch (message.type) {
        case 'WIDGET_INITIAL_STATE':
          if (message.widgetId === widgetId) {
            setWidget(message.widget);
            setLoading(false);
          }
          break;

        case 'WIDGET_STATE_UPDATE':
          if (message.widgetId === widgetId) {
            setWidget((prev) =>
              prev
                ? {
                    ...prev,
                    state: message.state,
                  }
                : null,
            );
          }
          break;

        case 'WIDGET_CONFIG_UPDATE':
          if (message.widgetId === widgetId) {
            setWidget((prev) =>
              prev
                ? {
                    ...prev,
                    config: message.config,
                  }
                : null,
            );
          }
          break;

        case 'WIDGET_ACTION_RESPONSE':
          if (message.widgetId === widgetId && !message.success) {
            setError(message.error || 'Action failed');
          }
          break;
      }
    });

    // Cleanup: unsubscribe from widget and remove listener
    return () => {
      websocket.send({
        type: 'WIDGET_UNSUBSCRIBE',
        widgetId,
      });
      websocket.unsubscribe(handleId);
    };
  }, [websocket, widgetId]);

  // Helper to execute actions
  const executeAction = (action: string, payload?: Record<string, unknown>) => {
    if (!websocket) {
      throw new Error('WebSocket not available');
    }

    websocket.send({
      type: 'WIDGET_ACTION',
      widgetId,
      action,
      payload,
    });
  };

  return {
    widget,
    loading,
    error,
    executeAction,
  };
}
