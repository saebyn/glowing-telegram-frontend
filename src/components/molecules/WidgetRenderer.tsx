import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import { widgetRegistry } from '@/widgets';

function WidgetRenderer({
  widgetId,
  widgetType,
  ...props
}: {
  widgetId: string;
  widgetType?: string;
  [key: string]: unknown;
}) {
  const { widget, loading, error } = useWidgetSubscription(widgetId);

  if (loading) {
    // Get loading component from registry
    const LoadingComponent = widgetRegistry.getLoadingComponent(
      widgetType || null,
    );
    return <LoadingComponent />;
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
  return <WidgetComponent widgetId={widgetId} {...props} />;
}

export default WidgetRenderer;
