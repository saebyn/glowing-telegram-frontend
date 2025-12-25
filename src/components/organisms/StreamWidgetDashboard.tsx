import { Grid2 } from '@mui/material';
import { Suspense } from 'react';
import { useGetList } from 'react-admin';
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
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-white text-2xl animate-pulse">
              Loading widget...
            </div>
          </div>
        }
      >
        <Grid2 container spacing={2}>
          {streamWidgets?.map((widget) => (
            <Grid2 size={3} key={widget.id}>
              <WidgetRenderer
                widgetId={widget.id}
                widgetType={widget.type}
                showControls={true}
              />
            </Grid2>
          ))}
        </Grid2>
        <button type="button" onClick={() => refetch()}>
          Refresh
        </button>
      </Suspense>
    </WebsocketProvider>
  );
}

export default StreamWidgetDashboard;
