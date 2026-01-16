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
        startTime: shouldAutoStart ? Date.now() : null,
        isRinging: true
    };

    // If auto-starting, we need to set the new alarm immediately
    if (shouldAutoStart) {
        await chrome.alarms.clear(ALARM_NAME);
        const fireDate = Date.now() + (nextDuration * 60 * 1000);
        await chrome.alarms.create(ALARM_NAME, { when: fireDate });
    }

    await setStorage({
      timer: newTimerState as any, 
      history: newHistory,
      tasks: newTasks
    });
  }
});

// Strict Mode: Site Blocking
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const { settings, timer } = await getStorage();
        
        // Only block if Strict Mode ON AND Timer is Running AND Mode is Focus
        if (settings.strictMode && timer.status === 'running' && timer.mode === 'focus') {
            const domain = new URL(tab.url).hostname;
            
            const isBlocked = settings.blockedSites.some(site => domain.includes(site));
            
            if (isBlocked) {
                // Redirect to blocked page
                const blockedPage = chrome.runtime.getURL('blocked.html');
                if (tab.url !== blockedPage) {
                    chrome.tabs.update(tabId, { url: blockedPage });
                }
            }
        }
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
