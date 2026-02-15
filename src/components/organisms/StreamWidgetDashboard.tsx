import Grid from '@mui/material/Grid';
import { Suspense } from 'react';
import { useGetList } from 'react-admin';
import { ErrorBoundary } from 'react-error-boundary';
import WidgetRenderer from '@/components/molecules/WidgetRenderer';
import { WebsocketProvider } from '@/hooks/useWebsocket';

const { VITE_WEBSOCKET_URL: WEBSOCKET_URL } = import.meta.env;

function StreamWidgetDashboard() {
  const {
    isPending,
    data: streamWidgets,
    error,
    refetch,
  } = useGetList('stream_widgets', {
    filter: {
      showOnDashboard: true,
    },
  });

  if (isPending) {
    return <div>Loading stream widgets...</div>;
  }

  if (error) {
    return <div>Error loading stream widgets: {error.message}</div>;
  }

  return (
    <WebsocketProvider url={WEBSOCKET_URL}>
      <Suspense
        fallback={
          <div className="text-white text-2xl animate-pulse">
            Loading widget...
          </div>
        }
      >
        <Grid container spacing={2}>
          {streamWidgets?.map((widget) => (
            <Grid size={3} key={widget.id}>
              <ErrorBoundary fallback={<div>Error loading widget.</div>}>
                <WidgetRenderer
                  widgetId={widget.id}
                  widgetType={widget.type}
                  showControls={true}
                />
              </ErrorBoundary>
            </Grid>
          ))}
        </Grid>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 p-2 bg-blue-600 text-white rounded"
        >
          Refresh
        </button>
      </Suspense>
    </WebsocketProvider>
  );
}

export default StreamWidgetDashboard;
