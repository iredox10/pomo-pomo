import { useEffect, useState } from 'react';
import { getStorage, setStorage, TimerState, TimerMode, defaultTimer, SessionLog } from '../storage';

export function usePomodoro() {
  const [timer, setTimer] = useState<TimerState>(defaultTimer);
  const [timeLeft, setTimeLeft] = useState(defaultTimer.duration * 60);

  // Sync with storage periodically and on mount
  useEffect(() => {
    const fetchStorage = async () => {
      const { timer: storedTimer } = await getStorage();
      setTimer(storedTimer);
      updateDisplayTime(storedTimer);
    };

    fetchStorage();

    const interval = setInterval(fetchStorage, 1000); // Sync every second for drift correction
    
    // Also listen for storage changes (from background worker)
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.timer) {
        const newTimer = changes.timer.newValue as TimerState;
        setTimer(newTimer);
        updateDisplayTime(newTimer);
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => {
      clearInterval(interval);
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const updateDisplayTime = (currentTimer: TimerState) => {
    if (currentTimer.status === 'running' && currentTimer.startTime) {
      const elapsed = (Date.now() - currentTimer.startTime) / 1000;
      const remaining = Math.max(0, (currentTimer.duration * 60) - elapsed);
      setTimeLeft(Math.round(remaining));
    } else {
      setTimeLeft(currentTimer.timeLeft);
    }
  };

  const startTimer = async () => {
    const { timer: latestTimer } = await getStorage();
    if (latestTimer.status === 'running') return;

    const startTime = Date.now();
    // If resuming, we need to calculate implied start time based on timeLeft
    // But simplified: Just set startTime and keep duration same? 
    // No, better to treat duration as fixed "session length" and timeLeft as variable.
    // Actually for resuming: New StartTime = Now - (OriginalDuration - TimeLeft)
    // Let's stick to the plan: storage stores `timeLeft` when paused.
    // When starting: `startTime = Date.now()`, and we use `timeLeft` as the effective duration for this run.
    // Wait, the alarm logic in background needs a specific time to fire.
    
    const durationInSeconds = latestTimer.timeLeft; 
    const fireDate = Date.now() + (durationInSeconds * 1000);

    // Create Alarm
    chrome.alarms.create('pomodoro-timer', { when: fireDate });

    // Update Storage
    // We adjust startTime so that (Now - StartTime) = (FullDuration - TimeLeft) is NOT the math.
    // simpler: The background alarm handles the "end". The UI just counts down to that "end".
    // But we need to save state.
    
    await setStorage({
      timer: {
        ...latestTimer,
        status: 'running',
        startTime: startTime,
        // We don't change 'duration' (that's the total length, e.g. 25m), 
        // but for calculation we might need an "offset" or just rely on the fact that
        // we are counting down `timeLeft` seconds from `startTime`.
        // Let's rely on: Running => EndTime = startTime + timeLeft(seconds) * 1000
        // UI: Remaining = (startTime + timeLeft*1000) - Now
      }
    });
    // Note: The `updateDisplayTime` logic needs to match this.
    // My previous logic: `remaining = duration*60 - elapsed` assumes we started from 0.
    // If we resume, that math fails unless we shift startTime back.
    // Correct approach for resume:
    // effectiveStartTime = Date.now() - ((TotalDuration - CurrentTimeLeft) * 1000)
    // But that's complex.
    // Easier: Just store `endTime` in storage?
    // Let's stick to the current structure but refine `updateDisplayTime`.
    // Actually, `startTime` in my interface comment said "when timer started/resumed".
    // So if I resume with 10 mins left:
    // startTime = Now.
    // Logic: Remaining = `storedTimeLeft` - (Now - `startTime`).
    // This is robust.
  };

  const pauseTimer = async () => {
    const { timer: latestTimer } = await getStorage();
    if (latestTimer.status !== 'running' || !latestTimer.startTime) return;

    const elapsed = (Date.now() - latestTimer.startTime) / 1000;
    const newTimeLeft = Math.max(0, latestTimer.timeLeft - elapsed);

    chrome.alarms.clear('pomodoro-timer');

    await setStorage({
      timer: {
        ...latestTimer,
        status: 'paused',
        startTime: null,
        timeLeft: newTimeLeft
      }
    });
  };

  const resetTimer = async () => {
    const { settings, timer: latestTimer } = await getStorage();
    chrome.alarms.clear('pomodoro-timer');
    
    let newDuration = settings.focusDuration;
    if (latestTimer.mode === 'shortBreak') newDuration = settings.shortBreakDuration;
    if (latestTimer.mode === 'longBreak') newDuration = settings.longBreakDuration;

    await setStorage({
      timer: {
        ...latestTimer,
        status: 'idle',
        startTime: null,
        duration: newDuration,
        timeLeft: newDuration * 60
      }
    });
  };

  const setMode = async (mode: TimerMode) => {
    const { settings } = await getStorage();
    let newDuration = settings.focusDuration;
    if (mode === 'shortBreak') newDuration = settings.shortBreakDuration;
    if (mode === 'longBreak') newDuration = settings.longBreakDuration;

    await setStorage({
      timer: {
        status: 'idle',
        startTime: null,
        duration: newDuration,
        timeLeft: newDuration * 60,
        mode: mode,
        activeTaskId: null // Optional: clear task on mode switch? Maybe keep it.
      }
    });
  };

  // Refined Display Logic based on `startTimer` strategy
  const getDisplayTime = () => {
    if (timer.status === 'running' && timer.startTime) {
      const elapsed = (Date.now() - timer.startTime) / 1000;
      return Math.max(0, timer.timeLeft - elapsed);
    }
    return timer.timeLeft;
  };

  return {
    timer,
    timeLeft: getDisplayTime(),
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
  };
}
