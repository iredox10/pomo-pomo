export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  status: TimerStatus;
  startTime: number | null; // Timestamp when timer started/resumed
  duration: number; // Duration in minutes
  mode: TimerMode;
  timeLeft: number; // Remaining seconds when paused or initially
  activeTaskId: string | null;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomos: number;
  actualPomos: number;
  createdAt: number;
}

export interface Settings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomos: boolean;
  soundEnabled: boolean;
}

export interface SessionLog {
  id: string;
  timestamp: number;
  duration: number; // in minutes
  mode: TimerMode;
  taskId: string | null;
}

export interface LocalStorage {
  timer: TimerState;
  tasks: Task[];
  settings: Settings;
  history: SessionLog[];
}

export const defaultSettings: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartPomos: false,
  soundEnabled: true,
};

export const defaultTimer: TimerState = {
  status: 'idle',
  startTime: null,
  duration: 25,
  mode: 'focus',
  timeLeft: 25 * 60,
  activeTaskId: null,
};

export function getStorage(): Promise<LocalStorage> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (result) => {
      resolve({
        timer: result.timer ?? defaultTimer,
        tasks: result.tasks ?? [],
        settings: result.settings ?? defaultSettings,
        history: result.history ?? [],
      } as LocalStorage);
    });
  });
}

export function setStorage(data: Partial<LocalStorage>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

export function getSettings(): Promise<Settings> {
    return getStorage().then(s => s.settings);
}

export function getTimer(): Promise<TimerState> {
    return getStorage().then(s => s.timer);
}
