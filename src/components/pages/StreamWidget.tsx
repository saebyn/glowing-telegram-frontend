import { lazy, Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { WebsocketProvider } from '@/hooks/useWebsocket';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

// Lazy load widget components for better code splitting
const WidgetRenderer = lazy(
  () => import('@/components/molecules/WidgetRenderer'),
);

function StreamWidget() {
  const { widgetId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const widgetType = searchParams.get('type'); // Get widget type from URL

  if (!widgetId) {
    return <div>Invalid widget ID</div>;
  }

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

export default StreamWidget;
