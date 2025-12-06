import { useParams, useSearchParams } from 'react-router-dom';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import CountdownTimerWidget from '@/widgets/CountdownTimerWidget';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

function StreamWidget() {
  const { widget, params, widgetId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Support both old and new routing patterns
  if (widgetId) {
    // New pattern: /widgets/:widgetId?token=...
    return (
      <WebsocketProvider url={WEBSOCKET_URL} token={token || undefined}>
        <WidgetRenderer widgetId={widgetId} />
      </WebsocketProvider>
    );
  }

  // Old pattern: /widgets/:widget/:params (fallback for backwards compatibility)
  const parsedParams = parseParams(params);

  if (!parsedParams) {
    return <p>Invalid params</p>;
  }

  switch (widget) {
    case 'countdown':
      return <CountdownTimerWidget {...parsedParams} />;
    default:
      return <p>Unknown widget: {widget}</p>;
  }
}

function WidgetRenderer({ widgetId }: { widgetId: string }) {
  const { widget, loading, error } = useWidgetSubscription(widgetId);

  if (loading) {
    return (
      <div className="screen-content">
        <p>Loading widget...</p>
      </div>
    );
  }

  if (error || !widget) {
    return (
      <div className="screen-content">
        <p>Error loading widget: {error || 'Widget not found'}</p>
      </div>
    );
  }

  // Render widget based on type
  switch (widget.type) {
    case 'countdown':
      return <CountdownTimerWidget widgetId={widgetId} />;
    default:
      return (
        <div className="screen-content">
          <p>Unknown widget type: {widget.type}</p>
        </div>
      );
  }
}

function parseParams(params: string | undefined) {
  if (!params) {
    return null;
  }
  try {
    return JSON.parse(atob(params));
  } catch (_e) {
    return null;
  }
}

export default StreamWidget;
