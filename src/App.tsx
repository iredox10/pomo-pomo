import { useState } from 'react';
import { TimerView } from './components/TimerView';
import { TaskView } from './components/TaskView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { AlarmsView } from './components/AlarmsView';
import { Timer, CheckSquare, BarChart2, Settings, AlarmClock, BellOff } from 'lucide-react';
import { usePomodoro } from './hooks/usePomodoro';
import clsx from 'clsx';

export type View = 'timer' | 'tasks' | 'alarms' | 'stats' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('timer');
  const { timer, stopAlarm } = usePomodoro();

  const renderView = () => {
    switch (currentView) {
      case 'timer': return <TimerView />;
      case 'tasks': return <TaskView onNavigate={setCurrentView} />;
      case 'alarms': return <AlarmsView />;
      case 'stats': return <StatsView />;
      case 'settings': return <SettingsView />;
      default: return <TimerView />;
    }
  };

  const navItems: { id: View; icon: React.ElementType; label: string }[] = [
    { id: 'timer', icon: Timer, label: 'Focus' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'alarms', icon: AlarmClock, label: 'Alarms' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden relative">
      
      {/* Global Alarm Overlay */}
      {timer.isRinging && (
          <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
              <div className="text-6xl mb-8 animate-bounce">🔔</div>
              <h2 className="text-2xl font-bold mb-8">Alarm Ringing!</h2>
              <button 
                onClick={stopAlarm}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-lg hover:scale-105 transition-all"
              >
                  <BellOff className="w-6 h-6" />
                  Stop
              </button>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-around px-2 z-10 shrink-0">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              currentView === item.id ? "text-blue-500" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
