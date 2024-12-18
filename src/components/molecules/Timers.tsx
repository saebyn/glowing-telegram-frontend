import { useTimerManager, useTimers } from '@/timers';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function Timers() {
  const timerManager = useTimerManager();
  const timers = useTimers(timerManager);

  return (
    <>
      {timers.map((timer) => (
        <div key={timer.id}>
          <Typography variant="h6">{timer.name}</Typography>
          <Typography>Duration: {timer.duration.toFixed(1)} seconds</Typography>
          <Typography>
            Time left: {timer.durationLeft.toFixed(1)} seconds
          </Typography>
          <Button
            onClick={() => timerManager?.startTimer(timer.id)}
            disabled={timer.enabled || !timerManager}
          >
            Start
          </Button>
          <Button
            onClick={() => timerManager?.pauseTimer(timer.id)}
            disabled={!timer.enabled || !timerManager}
          >
            Pause
          </Button>
          <Button
            onClick={() => timerManager?.resetTimer(timer.id)}
            disabled={timer.durationLeft === timer.duration || !timerManager}
          >
            Reset
          </Button>
        </div>
      ))}
    </>
  );
}

export default Timers;
