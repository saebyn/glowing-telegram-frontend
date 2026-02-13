import { createContext, useContext, useEffect, useState } from 'react';

interface Timer {
  id: string;
  name: string;
  duration: number;
  durationLeft: number;
  enabled: boolean;
}

const EVENT_TYPE_PAUSE_TIMER = 'pauseTimer';
const EVENT_TYPE_START_TIMER = 'startTimer';
const EVENT_TYPE_RESET_TIMER = 'resetTimer';

export class TimerManager {
  private channel: BroadcastChannel;
  private lastTickDate: Date | null = null;
  private timers: Timer[] = [];
  private subscribers: ((timers: Timer[]) => void)[] = [];

  constructor() {
    console.log('TimerManager created');
    this.channel = new BroadcastChannel('timers');

    this.channel.onmessage = (event) => {
      switch (event.data.type) {
        case EVENT_TYPE_PAUSE_TIMER:
        case EVENT_TYPE_START_TIMER:
        case EVENT_TYPE_RESET_TIMER:
          this.updateTimer(event.data.timer.id, event.data.timer);
          break;
      }
    };
  }

  onTimerChange(callback: (timers: Timer[]) => void): () => void {
    const index = this.subscribers.push(callback) - 1;

    return () => {
      this.subscribers.splice(index, 1);
    };
  }

  dispose() {
    console.log('TimerManager disposed');
    this.channel.onmessage = null;
    this.channel.close();
  }

  tick() {
    const now = new Date();
    if (!this.lastTickDate) {
      this.lastTickDate = now;
      return;
    }

    const elapsedMs = now.getTime() - this.lastTickDate.getTime();
    this.lastTickDate = now;

    this.timers = this.timers.map((timer) => {
      if (!timer.enabled) {
        return timer;
      }

      const durationLeft = timer.durationLeft - elapsedMs / 1000;

      return {
        ...timer,
        durationLeft: Math.max(0, durationLeft),
      };
    });
  }

  pauseTimer(id: string) {
    this.timers = this.timers.map((timer) =>
      timer.id === id ? { ...timer, enabled: false } : timer,
    );
    this.channel.postMessage({
      type: EVENT_TYPE_PAUSE_TIMER,
      timer: this.timers.find((t) => t.id === id),
    });
  }

  startTimer(id: string) {
    this.timers = this.timers.map((timer) =>
      timer.id === id ? { ...timer, enabled: true } : timer,
    );

    this.channel.postMessage({
      type: EVENT_TYPE_START_TIMER,
      timer: this.timers.find((t) => t.id === id),
    });
  }

  resetTimer(id: string) {
    this.timers = this.timers.map((timer) =>
      timer.id === id
        ? { ...timer, durationLeft: timer.duration, enabled: false }
        : timer,
    );

    this.channel.postMessage({
      type: EVENT_TYPE_RESET_TIMER,
      timer: this.timers.find((t) => t.id === id),
    });
  }

  updateTimer(id: string, timer: Timer) {
    this.timers = this.timers.map((t) => (t.id === id ? timer : t));
  }

  getTimers() {
    return this.timers;
  }

  setTimers(timers: Timer[]) {
    this.timers = timers;
  }
}

export const TimerManagerContext = createContext<TimerManager | null>(null);

export function TimerManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timerManager] = useState(() => new TimerManager());

  useEffect(() => {
    return () => {
      timerManager.dispose();
    };
  }, [timerManager]);

  return (
    <TimerManagerContext.Provider value={timerManager}>
      {children}
    </TimerManagerContext.Provider>
  );
}

export function useTimerManager() {
  const timerManager = useContext(TimerManagerContext);

  if (!timerManager) {
    throw new Error(
      'useTimerManager must be used within a TimerManagerProvider',
    );
  }

  return timerManager;
}

export function useTimers(timerManager: TimerManager) {
  const [timers, setTimers] = useState<Timer[]>([]);

  useEffect(() => {
    const abortController = new AbortController();

    fetch('/api/timers', { signal: abortController.signal })
      .then((response) => response.json())
      .then(({ data }) => {
        setTimers(data);
        timerManager.setTimers(data);
      });

    return () => {
      abortController.abort();
    };
  }, [timerManager]);

  useEffect(() => {
    const interval = setInterval(() => {
      timerManager.tick();
      setTimers(timerManager.getTimers());
    }, 100);

    const unsubscribe = timerManager.onTimerChange((timers) => {
      setTimers(timers);
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [timerManager]);

  return timers;
}
