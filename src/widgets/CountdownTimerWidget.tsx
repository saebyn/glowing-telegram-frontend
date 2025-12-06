import { useRef } from 'react';
import useTextJumble from '@/hooks/useTextJumble';
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import type { CountdownTimerConfig, CountdownTimerState } from '@/types';

interface CountdownTimerWidgetProps {
  widgetId: string;
}

/**
 * CountdownTimerWidget
 *
 * This component is used to display a countdown timer in an OBS browser source.
 *
 * It uses the `useWidgetSubscription` hook to subscribe to widget updates via WebSocket.
 * The widget configuration and state are managed by the backend.
 */
function CountdownTimerWidget({ widgetId }: CountdownTimerWidgetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useTextJumble(titleRef);

  // Subscribe to widget via WebSocket
  const { widget, loading, error } = useWidgetSubscription(widgetId);

  if (loading) {
    return <div className="screen-content">Loading...</div>;
  }

  if (error || !widget) {
    return <div className="screen-content">Error loading widget</div>;
  }

  // Extract config and state
  const config = widget.config as unknown as CountdownTimerConfig;
  const state = widget.state as unknown as CountdownTimerState;

  const countdownTimeFormatted = new Date(state.durationLeft * 1000)
    .toISOString()
    .substring(14, 14 + 5);

  return (
    <div className="screen-content">
      <p>{config.text}</p>
      <h1 ref={titleRef}>{config.title}</h1>

      <p className="countdown">
        <span className="countdown-time">{countdownTimeFormatted}</span>
      </p>
    </div>
  );
}

export default CountdownTimerWidget;
