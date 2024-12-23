import useTextJumble from '@/hooks/useTextJumble';
import { useTimerManager } from '@/hooks/useTimers';
import { useRef } from 'react';

interface CountdownTimerWidgetProps {
  timerId: string;
  text: string;
  title: string;
}

/**
 * CountdownTimerWidget
 *
 * This component is used to display a countdown timer in an OBS browser source.
 *
 * It uses the `useTimerManager` hook to get the list of timers from the TimerManager.
 * It takes a `timerId` prop to determine which timer to display.
 */
function CountdownTimerWidget({
  timerId,
  text,
  title,
}: CountdownTimerWidgetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useTextJumble(titleRef);

  const timerManager = useTimerManager();
  const timer = timerManager.getTimers().find((t) => t.id === timerId);

  if (!timer) {
    return null;
  }

  const countdownTimeFormatted = new Date(timer.durationLeft * 1000)
    .toISOString()
    .substring(14, 14 + 5);

  return (
    <div className="screen-content">
      <p>{text}</p>
      <h1 ref={titleRef}>{title}</h1>

      <p className="countdown">
        <span className="countdown-time">{countdownTimeFormatted}</span>
      </p>
    </div>
  );
}

export default CountdownTimerWidget;
