import { DateTime, Duration } from 'luxon';
import { useEffect, useRef } from 'react';
import useTextJumble from '@/hooks/useTextJumble';
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import type { CountdownTimerWidgetInstance } from '@/types';

interface CountdownTimerWidgetProps {
  widgetId: string;
}

function calculateDurationLeft(widget: CountdownTimerWidgetInstance): Duration {
  if (!widget.state.enabled) {
    return Duration.fromObject({ seconds: widget.state.duration_left });
  }

  const lastTick = DateTime.fromISO(widget.state.last_tick_timestamp);
  const now = DateTime.now();
  const elapsedSeconds = now.diff(lastTick, 'seconds').seconds;

  return Duration.fromObject({
    seconds: Math.max(
      0,
      widget.state.duration_left - Math.floor(elapsedSeconds),
    ),
  });
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
  const { widget, loading, error, setWidget } =
    useWidgetSubscription<CountdownTimerWidgetInstance>(widgetId);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidget((prevWidget) => {
        if (!prevWidget) return prevWidget;

        if (prevWidget.state.enabled && prevWidget.state.duration_left > 0) {
          const now = DateTime.now();
          const newDurationLeft = calculateDurationLeft(prevWidget);

          return {
            ...prevWidget,
            state: {
              ...prevWidget.state,
              duration_left: newDurationLeft.as('seconds'),
              last_tick_timestamp: now.toISO(),
            },
          };
        }
        return prevWidget;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setWidget]);

  if (loading) {
    return <div className="screen-content">Loading...</div>;
  }

  if (error || !widget) {
    return <div className="screen-content">Error loading widget</div>;
  }

  const durationRemaining = calculateDurationLeft(widget);

  return (
    <div className="screen-content">
      <p>{widget.config.text}</p>
      <h1 ref={titleRef}>{widget.config.title}</h1>

      <p className="countdown">
        <span className="countdown-time">{durationRemaining.toHuman()}</span>
      </p>
    </div>
  );
}

export default CountdownTimerWidget;
