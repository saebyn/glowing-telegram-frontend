import { lazy, Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { WebsocketProvider } from '@/hooks/useWebsocket';
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import { widgetRegistry } from '@/widgets';
import CountdownTimerSkeleton from '@/widgets/countdown-timer/CountdownTimerSkeleton';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

// Lazy load widget components for better code splitting
const CountdownTimerWidget = lazy(
  () => import('@/widgets/CountdownTimerWidget'),
);

function StreamWidget() {
  const { widget, params, widgetId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const widgetType = searchParams.get('type'); // Get widget type from URL

  // Support both old and new routing patterns
  if (widgetId) {
    // New pattern: /widgets/:widgetId?token=...&type=...
    return (
      <WebsocketProvider url={WEBSOCKET_URL} token={token || undefined}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-white text-2xl animate-pulse">
                Loading widget...
              </div>
            </div>
          }
        >
          <WidgetRenderer
            widgetId={widgetId}
            widgetType={widgetType || undefined}
          />
        </Suspense>
      </WebsocketProvider>
    );
  }

  // Old pattern: /widgets/:widget/:params (fallback for backwards compatibility)
  const parsedParams = parseParams(params);

  if (!parsedParams) {
    return <p>Invalid params</p>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl animate-pulse">
            Loading widget...
          </div>
        </div>
      }
    >
      {(() => {
        switch (widget) {
          case 'countdown':
            return <CountdownTimerWidget {...parsedParams} />;
          default:
            return <p>Unknown widget: {widget}</p>;
        }
      })()}
    </Suspense>
  );
}

function WidgetRenderer({
  widgetId,
  widgetType,
}: {
  widgetId: string;
  widgetType?: string;
}) {
  const { widget, loading, error } = useWidgetSubscription(widgetId);

  if (loading) {
    // If we know the widget type from the URL, show the appropriate skeleton
    if (widgetType === 'countdown_timer') {
      return <CountdownTimerSkeleton />;
    }

    // Fallback skeleton for unknown widget types
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

  // Get widget definition from registry
  const widgetDef = widgetRegistry.get(widget.type);

  if (!widgetDef) {
    return (
      <div className="screen-content">
        <p>Unknown widget type: {widget.type}</p>
      </div>
    );
  }

  // Render widget using the component from the registry
  const WidgetComponent = widgetDef.component;
  return <WidgetComponent widgetId={widgetId} />;
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
