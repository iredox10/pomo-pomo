import { getStorage, setStorage, defaultSettings, defaultTimer, SessionLog, Task, TimerMode } from './storage';

const ALARM_NAME = 'pomodoro-timer';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  const storage = await getStorage();
  if (!storage.timer) {
    await setStorage({
      timer: defaultTimer,
      settings: defaultSettings,
      tasks: [],
      history: []
    });
  }
});

// Handle alarms (Timer finished)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const { timer, settings, history, tasks } = await getStorage();
    
    // Play sound via offscreen
    if (settings.soundEnabled) {
      await playSound('alarm');
    }

    // Send notification
    const isFocus = timer.mode === 'focus';
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Time is up!',
      message: isFocus ? 'Focus session complete. Take a break!' : 'Break is over. Back to work!',
      priority: 2
    });

    // Create Session Log
    const newLog: SessionLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: timer.duration, 
      mode: timer.mode,
      taskId: timer.activeTaskId
    };

    const newHistory = [...history, newLog];

    // Update Task Progress
    let newTasks = [...tasks];
    if (isFocus && timer.activeTaskId) {
      newTasks = tasks.map(t => 
        t.id === timer.activeTaskId 
          ? { ...t, actualPomos: (t.actualPomos || 0) + 1 }
          : t
      );
    }

    // Calculate Next State
    let nextMode: TimerMode = timer.mode;
    let nextDuration = 0;
    let shouldAutoStart = false;

    if (isFocus) {
        // Focus -> Break
        // Simple logic: every 4th pomo could be a long break, but for now let's default to Short Break
        // unless the user manually selected Long Break previously? No, let's standard flow: Focus -> Short Break
        nextMode = 'shortBreak';
        nextDuration = settings.shortBreakDuration;
        shouldAutoStart = settings.autoStartBreaks;
    } else {
        // Break -> Focus
        nextMode = 'focus';
        nextDuration = settings.focusDuration;
        shouldAutoStart = settings.autoStartPomos;
    }

    // Update Storage
    const newTimerState = {
        ...timer,
        status: shouldAutoStart ? 'running' : 'idle',
        mode: nextMode,
        duration: nextDuration,
        timeLeft: nextDuration * 60,
        startTime: shouldAutoStart ? Date.now() : null
    };

    // If auto-starting, we need to set the new alarm immediately
    if (shouldAutoStart) {
        // Clear old alarm just in case
        await chrome.alarms.clear(ALARM_NAME);
        const fireDate = Date.now() + (nextDuration * 60 * 1000);
        await chrome.alarms.create(ALARM_NAME, { when: fireDate });
    }

    await setStorage({
      timer: newTimerState as any, // TS Cast for safety if needed
      history: newHistory,
      tasks: newTasks
    });
  }
});

// Audio Offscreen Management
async function playSound(type: 'alarm' | 'white-noise') {
  await setupOffscreenDocument('offscreen.html');
  chrome.runtime.sendMessage({ type: 'PLAY_SOUND', payload: { sound: type } });
}

async function setupOffscreenDocument(path: string) {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [chrome.runtime.getURL(path)]
  });

  if (existingContexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Notification sounds and white noise',
  });
}
