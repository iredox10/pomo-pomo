import { useEffect, useState } from 'react';
import { getStorage, setStorage, Alarm, RecurrenceType } from '../storage';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const fetchAlarms = async () => {
    const storage = await getStorage();
    setAlarms(storage.alarms);
  };

  useEffect(() => {
    fetchAlarms();
    
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.alarms) {
        setAlarms(changes.alarms.newValue as Alarm[]);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const addAlarm = async (time: number, label: string, recurrence: RecurrenceType) => {
    const newAlarm: Alarm = {
      id: crypto.randomUUID(),
      time,
      label,
      recurrence,
      enabled: true
    };
    
    const { alarms: currentAlarms } = await getStorage();
    const updatedAlarms = [...currentAlarms, newAlarm];
    await setStorage({ alarms: updatedAlarms });
    
    // Trigger background worker to schedule it
    chrome.runtime.sendMessage({ type: 'SCHEDULE_ALARM', payload: newAlarm });
  };

  const toggleAlarm = async (id: string) => {
    const { alarms: currentAlarms } = await getStorage();
    const alarm = currentAlarms.find(a => a.id === id);
    if (!alarm) return;

    const updatedAlarms = currentAlarms.map(a => 
        a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    await setStorage({ alarms: updatedAlarms });

    const updatedAlarm = updatedAlarms.find(a => a.id === id);
    if (updatedAlarm?.enabled) {
        chrome.runtime.sendMessage({ type: 'SCHEDULE_ALARM', payload: updatedAlarm });
    } else {
        chrome.runtime.sendMessage({ type: 'CANCEL_ALARM', payload: { id } });
    }
  };

  const deleteAlarm = async (id: string) => {
    const { alarms: currentAlarms } = await getStorage();
    const updatedAlarms = currentAlarms.filter(a => a.id !== id);
    await setStorage({ alarms: updatedAlarms });
    chrome.runtime.sendMessage({ type: 'CANCEL_ALARM', payload: { id } });
  };

  return {
    alarms,
    addAlarm,
    toggleAlarm,
    deleteAlarm
  };
}
