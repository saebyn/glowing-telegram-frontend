import { DateTime, Duration } from 'luxon';
import { useEffect, useRef, useState } from 'react';
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

// Audio configuration constants
const BEEP_FREQUENCY = 800; // Hz
const BEEP_INITIAL_VOLUME = 0.3;
const BEEP_FINAL_VOLUME = 0.01;
const BEEP_DURATION = 0.5; // seconds

function playEndSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = BEEP_FREQUENCY;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(BEEP_INITIAL_VOLUME, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      BEEP_FINAL_VOLUME,
      audioContext.currentTime + BEEP_DURATION,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + BEEP_DURATION);

    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch (error) {
    // Silently fail if Web Audio API is not supported
    console.debug('Web Audio API not supported:', error);
  }
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
  const [isPaused, setIsPaused] = useState(false);
  const hasPlayedEndSound = useRef(false);

  useTextJumble(titleRef);

  // Subscribe to widget via WebSocket
  const { widget, loading, error, setWidget } =
    useWidgetSubscription<CountdownTimerWidgetInstance>(widgetId);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidget((prevWidget) => {
        if (!prevWidget) return prevWidget;

        if (
          prevWidget.state.enabled &&
          prevWidget.state.duration_left > 0 &&
          !isPaused
        ) {
          const now = DateTime.now();
          const newDurationLeft = calculateDurationLeft(prevWidget);
          const newDurationLeftSeconds = newDurationLeft.as('seconds');

          // Check if timer just ended
          if (
            newDurationLeftSeconds <= 0 &&
            prevWidget.state.duration_left > 0 &&
            !hasPlayedEndSound.current
          ) {
            playEndSound();
            hasPlayedEndSound.current = true;
          }

          return {
            ...prevWidget,
            state: {
              ...prevWidget.state,
              duration_left: newDurationLeftSeconds,
              last_tick_timestamp: now.toISO(),
            },
          };
        }
        return prevWidget;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setWidget, isPaused]);

  // Reset the end sound flag when timer is reset
  useEffect(() => {
    if (widget && widget.state.duration_left > 0) {
      hasPlayedEndSound.current = false;
    }
  }, [widget]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !widget) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-red-800">
        <div className="text-white text-2xl">Error loading widget</div>
      </div>
    );
  }

  const durationRemaining = calculateDurationLeft(widget);
  const originalDuration = Duration.fromObject({
    seconds: widget.config.duration,
  });
  const progress =
    (durationRemaining.as('seconds') / originalDuration.as('seconds')) * 100;
  const isTimerEnded = durationRemaining.as('seconds') <= 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
      <div className="max-w-2xl w-full space-y-8">
        {/* Text and Title */}
        <div className="text-center space-y-4">
          <p className="text-xl md:text-2xl font-light text-purple-200">
            {widget.config.text}
          </p>
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
          >
            {widget.config.title}
          </h1>
        </div>

        {/* Timer Display */}
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-500 border-opacity-30">
          <div className="text-center space-y-6">
            {/* Main Timer */}
            <div
              className={`text-6xl md:text-8xl font-bold tabular-nums transition-colors duration-300 ${
                isTimerEnded
                  ? 'text-red-400 animate-pulse'
                  : isPaused
                    ? 'text-yellow-400'
                    : 'text-white'
              }`}
            >
              {durationRemaining.toFormat('hh:mm:ss')}
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-linear ${
                  isTimerEnded
                    ? 'bg-red-500'
                    : isPaused
                      ? 'bg-yellow-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>

            {/* Original Duration Display */}
            <div className="text-sm md:text-base text-purple-300 font-medium">
              Original Duration: {originalDuration.toFormat('hh:mm:ss')}
            </div>

            {/* Pause/Resume Button */}
            <button
              onClick={togglePause}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              type="button"
              aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>

            {/* Status Text */}
            {isPaused && (
              <div className="text-yellow-400 font-semibold animate-pulse">
                ⏸️ Timer Paused
              </div>
            )}
            {isTimerEnded && (
              <div className="text-red-400 font-bold text-2xl animate-pulse">
                ⏰ Time's Up!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimerWidget;
