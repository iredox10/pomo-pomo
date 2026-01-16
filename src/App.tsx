import { useState } from 'react';
import { TimerView } from './components/TimerView';
import { TaskView } from './components/TaskView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { Timer, CheckSquare, BarChart2, Settings } from 'lucide-react';
import clsx from 'clsx';

export type View = 'timer' | 'tasks' | 'stats' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('timer');

  const renderView = () => {
    switch (currentView) {
      case 'timer': return <TimerView />;
      case 'tasks': return <TaskView onNavigate={setCurrentView} />;
      case 'stats': return <StatsView />;
      case 'settings': return <SettingsView />;
      default: return <TimerView />;
    }
  };

  const navItems: { id: View; icon: React.ElementType; label: string }[] = [
    { id: 'timer', icon: Timer, label: 'Focus' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      
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
