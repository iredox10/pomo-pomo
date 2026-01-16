import { useEffect, useState } from 'react';
import { getStorage, setStorage, Task, TimerState } from '../storage';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    const storage = await getStorage();
    setTasks(storage.tasks);
    setActiveTaskId(storage.timer.activeTaskId);
  };

  useEffect(() => {
    fetchTasks();
    
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.tasks) {
        setTasks(changes.tasks.newValue as Task[]);
      }
      if (changes.timer) {
          // Check if activeTaskId changed
          const newTimer = changes.timer.newValue as TimerState;
          setActiveTaskId(newTimer.activeTaskId);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const addTask = async (title: string, estimatedPomos: number = 1) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      estimatedPomos,
      actualPomos: 0,
      createdAt: Date.now()
    };
    
    const { tasks: currentTasks } = await getStorage();
    await setStorage({ tasks: [...currentTasks, newTask] });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { tasks: currentTasks } = await getStorage();
    const newTasks = currentTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await setStorage({ tasks: newTasks });
  };

  const deleteTask = async (id: string) => {
    const { tasks: currentTasks, timer } = await getStorage();
    const newTasks = currentTasks.filter(t => t.id !== id);
    
    const updates: any = { tasks: newTasks };
    if (timer.activeTaskId === id) {
        updates.timer = { ...timer, activeTaskId: null };
    }
    await setStorage(updates);
  };

  const setActiveTask = async (id: string | null) => {
    const { timer } = await getStorage();
    await setStorage({
        timer: { ...timer, activeTaskId: id }
    });
  };

  return {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    setActiveTask
  };
}
