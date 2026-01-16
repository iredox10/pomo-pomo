import { useState } from 'react';
import { useAlarms } from '../hooks/useAlarms';
import { Alarm, RecurrenceType } from '../storage';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export function AlarmsView() {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm } = useAlarms();
  const [isAdding, setIsAdding] = useState(false);
  
  // New Alarm State
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('once');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !time) return;

    // Parse time input (HH:mm) to timestamp
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);

    // If time is past, set for tomorrow (unless it's just recurrence setup, but assume tomorrow for 'once' logic)
    if (alarmDate.getTime() < now.getTime()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }

    addAlarm(alarmDate.getTime(), label, recurrence);
    
    // Reset
    setLabel('');
    setTime('');
    setRecurrence('once');
    setIsAdding(false);
  };

  const formatRecurrence = (r: RecurrenceType) => {
      return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900 text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Alarms</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-3">
              <div>
                  <label className="text-xs text-gray-400 block mb-1">Label</label>
                  <input
                    autoFocus
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Wake up"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  />
              </div>
              
              <div className="flex gap-3">
                  <div className="flex-1">
                      <label className="text-xs text-gray-400 block mb-1">Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                      />
                  </div>
                  <div className="flex-1">
                      <label className="text-xs text-gray-400 block mb-1">Repeat</label>
                      <select
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                      >
                          <option value="once">Once</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                      </select>
                  </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                Set Alarm
              </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {alarms.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                <Bell className="w-12 h-12 mb-2 opacity-20" />
                <p>No alarms set</p>
            </div>
        )}

        {alarms.map(alarm => (
          <div 
            key={alarm.id}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
          >
            <div>
                <div className="text-2xl font-bold font-mono tracking-tight leading-none text-white">
                    {format(new Date(alarm.time), 'HH:mm')}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-300 font-medium">{alarm.label}</span>
                    <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                        {formatRecurrence(alarm.recurrence)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => toggleAlarm(alarm.id)}
                    className={clsx("transition-colors", alarm.enabled ? "text-blue-500" : "text-gray-600")}
                >
                    {alarm.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
                <button 
                    onClick={() => deleteAlarm(alarm.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
