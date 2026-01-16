import { useEffect, useState } from 'react';
import { getStorage, setStorage, TimerState, TimerMode, defaultTimer, TimerType } from '../storage';

export function usePomodoro() {
  const [timer, setTimer] = useState<TimerState>(defaultTimer);
  const [displayTime, setDisplayTime] = useState(defaultTimer.duration * 60);

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
      
      if (currentTimer.type === 'stopwatch') {
          // Stopwatch: StartValue (stored in timeLeft) + elapsed
          setDisplayTime(Math.round(currentTimer.timeLeft + elapsed));
      } else {
          // Timer: StartValue (stored in timeLeft) - elapsed
          const remaining = Math.max(0, currentTimer.timeLeft - elapsed);
          setDisplayTime(Math.round(remaining));
      }
    } else {
      setDisplayTime(currentTimer.timeLeft);
    }
  };

  const startTimer = async () => {
    const { timer: latestTimer } = await getStorage();
    if (latestTimer.status === 'running') return;

    const startTime = Date.now();
    
    if (latestTimer.type === 'timer') {
        const durationInSeconds = latestTimer.timeLeft; 
        const fireDate = Date.now() + (durationInSeconds * 1000);
        chrome.alarms.create('pomodoro-timer', { when: fireDate });
    }

    await setStorage({
      timer: {
        ...latestTimer,
        status: 'running',
        startTime: startTime,
        // For Timer: timeLeft is the starting "tank"
        // For Stopwatch: timeLeft is the accumulated duration so far
      }
    });
  };

  const pauseTimer = async () => {
    const { timer: latestTimer } = await getStorage();
    if (latestTimer.status !== 'running' || !latestTimer.startTime) return;

    const elapsed = (Date.now() - latestTimer.startTime) / 1000;
    let newTimeLeft = 0;

    if (latestTimer.type === 'stopwatch') {
        newTimeLeft = latestTimer.timeLeft + elapsed;
    } else {
        newTimeLeft = Math.max(0, latestTimer.timeLeft - elapsed);
    }

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
        timeLeft: latestTimer.type === 'timer' ? newDuration * 60 : 0 // Reset stopwatch to 0
      }
    });
  };

  const setMode = async (mode: TimerMode) => {
    const { settings, timer: latestTimer } = await getStorage();
    let newDuration = settings.focusDuration;
    if (mode === 'shortBreak') newDuration = settings.shortBreakDuration;
    if (mode === 'longBreak') newDuration = settings.longBreakDuration;

    await setStorage({
      timer: {
        ...latestTimer,
        status: 'idle',
        startTime: null,
        duration: newDuration,
        timeLeft: latestTimer.type === 'timer' ? newDuration * 60 : 0,
        mode: mode,
        // activeTaskId: null // Don't clear task on mode switch
      }
    });
  };

  const startTask = async (taskId: string | null) => {
      const { settings, timer: latestTimer, tasks } = await getStorage();
      
      let newDuration = settings.focusDuration;
      // If we are starting a specific task, check if it has a custom duration
      if (taskId) {
          const task = tasks.find(t => t.id === taskId);
          if (task && task.duration && task.duration > 0) {
              newDuration = task.duration;
          }
      }
      
      await setStorage({
          timer: {
              ...latestTimer,
              type: 'timer', // Force timer mode for tasks usually
              status: 'idle', // Or 'running' if we want auto-play
              startTime: null,
              duration: newDuration,
              timeLeft: newDuration * 60,
              mode: 'focus',
              activeTaskId: taskId
          }
      });
      // Update local state immediately for responsiveness
      setTimer(prev => ({
          ...prev,
          type: 'timer',
          status: 'idle',
          startTime: null,
          duration: newDuration,
          timeLeft: newDuration * 60,
          mode: 'focus',
          activeTaskId: taskId
      }));
      setDisplayTime(newDuration * 60);
  };

  const setType = async (type: TimerType) => {
    const { settings, timer: latestTimer } = await getStorage();
    let newDuration = settings.focusDuration;
    if (latestTimer.mode === 'shortBreak') newDuration = settings.shortBreakDuration;
    if (latestTimer.mode === 'longBreak') newDuration = settings.longBreakDuration;

    await setStorage({
        timer: {
            ...latestTimer,
            type: type,
            status: 'idle',
            startTime: null,
            duration: newDuration,
            timeLeft: type === 'timer' ? newDuration * 60 : 0
        }
    });
  };

  const stopAlarm = async () => {
    // 1. Clear ringing flag in storage
    const { timer: latestTimer } = await getStorage();
    await setStorage({
        timer: { ...latestTimer, isRinging: false }
    });
    setTimer(prev => ({ ...prev, isRinging: false }));

    // 2. Stop actual sound
    chrome.runtime.sendMessage({ type: 'STOP_SOUND' });
  };

  return {
    timer,
    timeLeft: displayTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    setType,
    startTask,
    stopAlarm
  };
}
