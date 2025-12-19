import { DateTime, Duration } from 'luxon';
import { useEffect, useRef } from 'react';
import useTextJumble from '@/hooks/useTextJumble';
import { useWebsocket } from '@/hooks/useWebsocket';
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

    // Close AudioContext after beep completes to free up resources
    setTimeout(
      () => {
        audioContext.close();
      },
      (BEEP_DURATION + 0.1) * 1000,
    );

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
  const hasPlayedEndSound = useRef(false);
  const previousDuration = useRef<number | null>(null);

  useTextJumble(titleRef);

  // Check if controls should be shown via query parameter
  const showControls =
    new URLSearchParams(window.location.search).get('controls') === 'true';

  // Subscribe to widget via WebSocket
  const { widget, loading, error, setWidget, executeAction } =
    useWidgetSubscription<CountdownTimerWidgetInstance>(widgetId);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidget((prevWidget) => {
        if (!prevWidget) return prevWidget;

        if (prevWidget.state.enabled && prevWidget.state.duration_left > 0) {
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
  }, [setWidget]);

  // Reset the end sound flag when timer duration is reset (increases from a lower value)
  useEffect(() => {
    const currentDuration = widget?.state.duration_left;
    if (currentDuration !== undefined) {
      if (
        previousDuration.current !== null &&
        currentDuration > previousDuration.current
      ) {
        // Duration increased, timer was reset
        hasPlayedEndSound.current = false;
      }
      previousDuration.current = currentDuration;
    }
  }, [widget?.state.duration_left]);

  // Derive paused state from backend: timer is paused when disabled but time remaining
  const isPaused = widget
    ? !widget.state.enabled && widget.state.duration_left > 0
    : false;

  const handleStart = () => {
    if (!widget) return;
    executeAction('start', {});
  };

  const handlePause = () => {
    if (!widget) return;
    executeAction('pause', {});
  };

  const handleResume = () => {
    if (!widget) return;
    executeAction('resume', {});
  };

  const handleReset = () => {
    if (!widget) return;
    executeAction('reset', {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 to-gray-800">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !widget) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-red-900 to-red-800">
        <div className="text-white text-2xl">Error loading widget</div>
      </div>
    );
  }

  const durationRemaining = calculateDurationLeft(widget);
  const originalDuration = Duration.fromObject({
    seconds: widget.config.duration,
  });
  const originalDurationSeconds = originalDuration.as('seconds');
  const progress =
    originalDurationSeconds > 0
      ? (durationRemaining.as('seconds') / originalDurationSeconds) * 100
      : 0;
  const isTimerEnded = durationRemaining.as('seconds') <= 0;

  // Appearance configuration with defaults
  const showBackground = widget.config.showBackground ?? true;
  const backgroundColor = widget.config.backgroundColor ?? undefined;
  const textColor = widget.config.textColor ?? 'white';
  const fontSize = widget.config.fontSize ?? 6; // rem units
  const showProgressBar = widget.config.showProgressBar ?? true;
  const showOriginalDuration = widget.config.showOriginalDuration ?? true;
  const showText = widget.config.showText ?? true;
  const showTitle = widget.config.showTitle ?? true;

  // Build container styles
  // If backgroundColor is set, use it; otherwise use gradient if showBackground is true
  const useGradient = showBackground && !backgroundColor;
  const containerClassName = useGradient
    ? 'flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white'
    : 'flex flex-col items-center justify-center min-h-screen p-8';

  const containerStyle =
    showBackground && backgroundColor ? { backgroundColor } : undefined;

  const textStyle = { color: textColor };
  const timerFontSize = `${fontSize}rem`;

  return (
    <div className={containerClassName} style={containerStyle}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Text and Title */}
        {(showText || showTitle) && (
          <div className="text-center space-y-4">
            {showText && (
              <p
                className="text-xl md:text-2xl font-light"
                style={showBackground ? undefined : textStyle}
              >
                {widget.config.text}
              </p>
            )}
            {showTitle && (
              <h1
                ref={titleRef}
                className="text-4xl md:text-6xl font-bold drop-shadow-lg"
                style={showBackground ? undefined : textStyle}
              >
                {widget.config.title}
              </h1>
            )}
          </div>
        )}

        {/* Timer Display */}
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-500 border-opacity-30">
          <div className="text-center space-y-6">
            {/* Main Timer */}
            <div
              className={`font-bold tabular-nums transition-colors duration-300 ${
                isTimerEnded
                  ? 'text-red-400 animate-pulse'
                  : isPaused
                    ? 'text-yellow-400'
                    : ''
              }`}
              style={{
                fontSize: timerFontSize,
                color:
                  isTimerEnded || isPaused
                    ? undefined
                    : showBackground
                      ? 'white'
                      : textColor,
              }}
            >
              {durationRemaining.toFormat('hh:mm:ss')}
            </div>

            {/* Progress Bar */}
            {showProgressBar && (
              <div className="relative w-full h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-linear ${
                    isTimerEnded
                      ? 'bg-red-500'
                      : isPaused
                        ? 'bg-yellow-500'
                        : 'bg-linear-to-r from-purple-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            )}

            {/* Original Duration Display */}
            {showOriginalDuration && (
              <div
                className="text-sm md:text-base font-medium"
                style={showBackground ? undefined : textStyle}
              >
                Original Duration: {originalDuration.toFormat('hh:mm:ss')}
              </div>
            )}

            {/* Control Panel - Only visible when controls parameter is true */}
            {showControls && (
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {/* Start Button - Only show when timer is not running and is at initial duration */}
                {!widget.state.enabled &&
                  widget.state.duration_left === widget.config.duration && (
                    <button
                      onClick={handleStart}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                      type="button"
                      aria-label="Start timer"
                    >
                      <span aria-hidden="true">▶️</span> Start
                    </button>
                  )}

                {/* Pause Button - Only show when timer is running */}
                {widget.state.enabled && (
                  <button
                    onClick={handlePause}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                    type="button"
                    aria-label="Pause timer"
                  >
                    <span aria-hidden="true">⏸️</span> Pause
                  </button>
                )}

                {/* Resume Button - Only show when timer is paused */}
                {isPaused && (
                  <button
                    onClick={handleResume}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    type="button"
                    aria-label="Resume timer"
                  >
                    <span aria-hidden="true">▶️</span> Resume
                  </button>
                )}

                {/* Reset Button - Show when timer has started (enabled or paused but not at initial duration) */}
                {(widget.state.enabled ||
                  widget.state.duration_left !== widget.config.duration) && (
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                    type="button"
                    aria-label="Reset timer"
                  >
                    <span aria-hidden="true">🔄</span> Reset
                  </button>
                )}
              </div>
            )}

            {/* Status Text */}
            {isPaused && (
              <div className="text-yellow-400 font-semibold animate-pulse">
                <span aria-hidden="true">⏸️</span> Timer Paused
              </div>
            )}
            {isTimerEnded && (
              <div className="text-red-400 font-bold text-2xl animate-pulse">
                <span aria-hidden="true">⏰</span> Time&apos;s Up!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimerWidget;
