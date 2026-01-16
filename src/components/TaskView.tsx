import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { CheckCircle2, Circle, Plus, Trash2, Play, Pause, Timer as TimerIcon, Pencil, X, Check } from 'lucide-react';
import clsx from 'clsx';
import { View } from '../App';

interface TaskViewProps {
  onNavigate?: (view: View) => void;
}

export function TaskView({ onNavigate }: TaskViewProps) {
  const { tasks, activeTaskId, addTask, updateTask, deleteTask, setActiveTask } = useTasks();
  
  // Create State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPomos, setNewTaskPomos] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPomos, setEditPomos] = useState(1);

  // Create Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskPomos);
    setNewTaskTitle('');
    setNewTaskPomos(1);
    setIsAdding(false);
  };

  // Edit Handlers
  const startEditing = (task: any) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditPomos(task.estimatedPomos);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditPomos(1);
  };

  const saveEditing = (id: string) => {
    if (!editTitle.trim()) return;
    updateTask(id, { title: editTitle, estimatedPomos: editPomos });
    setEditingId(null);
  };

  const handlePlayClick = (taskId: string) => {
    if (activeTaskId === taskId) {
       setActiveTask(null);
    } else {
       setActiveTask(taskId);
       if (onNavigate) {
         onNavigate('timer');
       }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900 text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateSubmit} className="mb-4 bg-gray-800 p-4 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-4">
          <input
            autoFocus
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 mb-3"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <TimerIcon className="w-4 h-4" />
                <span>Est. Pomodoros:</span>
                <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newTaskPomos}
                    onChange={(e) => setNewTaskPomos(parseInt(e.target.value) || 1)}
                    className="w-12 bg-gray-900 border border-gray-700 rounded p-1 text-center focus:border-blue-500 outline-none"
                />
            </div>
            
            <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
                Save
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tasks.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                <p>No tasks yet</p>
            </div>
        )}

        {tasks.map(task => {
          if (editingId === task.id) {
            return (
                <div key={task.id} className="bg-gray-800 p-3 rounded-xl border border-blue-500/50">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 mb-2 text-sm"
                        autoFocus
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <TimerIcon className="w-3 h-3" />
                            <input 
                                type="number" 
                                min="1" 
                                max="20"
                                value={editPomos}
                                onChange={(e) => setEditPomos(parseInt(e.target.value) || 1)}
                                className="w-10 bg-gray-900 border border-gray-700 rounded p-1 text-center focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={cancelEditing} className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><X className="w-4 h-4"/></button>
                            <button onClick={() => saveEditing(task.id)} className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white"><Check className="w-4 h-4"/></button>
                        </div>
                    </div>
                </div>
            );
          }

          return (
            <div 
                key={task.id}
                className={clsx(
                "group flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all border border-transparent",
                activeTaskId === task.id && "border-blue-500/50 bg-blue-500/10"
                )}
            >
                <button 
                onClick={() => updateTask(task.id, { completed: !task.completed })}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                {task.completed ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Circle className="w-5 h-5" />}
                </button>
                
                <div className="flex-1 min-w-0 cursor-default" onDoubleClick={() => startEditing(task)}>
                <span className={clsx("block truncate select-none", task.completed && "line-through text-gray-500")}>
                    {task.title}
                </span>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <span className={clsx(task.actualPomos >= task.estimatedPomos ? "text-green-400" : "text-gray-400")}>
                        {task.actualPomos}
                    </span>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-400">{task.estimatedPomos}</span>
                    <TimerIcon className="w-3 h-3 text-gray-600 ml-1" />
                </div>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button 
                        onClick={() => startEditing(task)}
                        className="p-2 text-gray-500 hover:text-blue-400"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => handlePlayClick(task.id)}
                        title={activeTaskId === task.id ? "Pause Task" : "Start Pomodoro"}
                        className={clsx(
                            "p-2 rounded-lg transition-all",
                            activeTaskId === task.id 
                                ? "bg-blue-500 text-white" 
                                : "text-gray-400 hover:text-white hover:bg-gray-700"
                        )}
                    >
                        {activeTaskId === task.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-500 hover:text-red-400"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
