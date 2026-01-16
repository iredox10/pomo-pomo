import { usePomodoro } from '../hooks/usePomodoro';
import { useTasks } from '../hooks/useTasks';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import clsx from 'clsx';
import { TimerMode } from '../storage';
import { useEffect } from 'react';

export function TimerView() {
  const { timer, timeLeft, startTimer, pauseTimer, resetTimer, setMode } = usePomodoro();
  const { tasks, activeTaskId } = useTasks();

  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.status === 'running') {
            pauseTimer();
        } else {
            startTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer.status, startTimer, pauseTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (timer.duration * 60)) * 100;
  
  // Circle Math
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  const modes: { id: TimerMode; label: string }[] = [
    { id: 'focus', label: 'Focus' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-6 relative">
      
      {/* Mode Toggles */}
      <div className="flex gap-2 mb-8 bg-gray-800 p-1 rounded-xl">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              timer.mode === mode.id ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={clsx(
              "transition-all duration-1000 ease-linear",
              timer.mode === 'focus' ? "text-blue-500" : "text-green-500"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold tracking-tighter tabular-nums font-mono">
            {formatTime(timeLeft)}
          </span>
          <span className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-medium">
            {timer.status === 'running' ? (timer.mode === 'focus' ? 'Focusing' : 'Break') : 'Paused'}
          </span>
        </div>
      </div>

      {/* Active Task Badge */}
      <div className="h-12 mb-6 w-full flex justify-center">
          {activeTask ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 flex items-center gap-2 max-w-[80%]">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="truncate text-sm text-gray-300">{activeTask.title}</span>
              </div>
          ) : timer.mode === 'focus' && (
              <div className="text-gray-500 text-sm italic">No active task selected</div>
          )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
          title="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={timer.status === 'running' ? pauseTimer : startTimer}
          className={clsx(
            "p-6 rounded-full transition-all shadow-lg hover:shadow-xl scale-100 hover:scale-105 active:scale-95",
            timer.mode === 'focus' ? "bg-blue-600 hover:bg-blue-500" : "bg-green-600 hover:bg-green-500"
          )}
          title="Play/Pause (Space)"
        >
          {timer.status === 'running' ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current translate-x-1" />
          )}
        </button>

        {/* Skip/Finish Button */}
         <button
            onClick={() => chrome.alarms.create('pomodoro-timer', { when: Date.now() + 100 })} 
            className="p-4 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
            title="Skip / Finish"
         >
            <SkipForward className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
}
