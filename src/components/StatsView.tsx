import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getStorage, SessionLog } from '../storage';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

export function StatsView() {
  const [history, setHistory] = useState<SessionLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalFocusMinutes: 0,
    totalSessions: 0,
    todayMinutes: 0
  });

  useEffect(() => {
    getStorage().then(storage => {
      setHistory(storage.history);
      processData(storage.history);
    });
  }, []);

  const processData = (logs: SessionLog[]) => {
    // Calculate Summary
    const focusLogs = logs.filter(l => l.mode === 'focus');
    const totalMinutes = focusLogs.reduce((acc, curr) => acc + curr.duration, 0);
    
    const today = new Date();
    const todayMinutes = focusLogs
      .filter(l => isSameDay(l.timestamp, today))
      .reduce((acc, curr) => acc + curr.duration, 0);

    setSummary({
      totalFocusMinutes: totalMinutes,
      totalSessions: focusLogs.length,
      todayMinutes
    });

    // Prepare Chart Data (Last 7 days)
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const minutes = focusLogs
        .filter(l => isSameDay(l.timestamp, date))
        .reduce((acc, curr) => acc + curr.duration, 0);
      
      data.push({
        name: format(date, 'EEE'), // Mon, Tue...
        minutes
      });
    }
    setChartData(data);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900 text-white overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Statistics</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-xl">
                <div className="text-gray-400 text-xs mb-1">Today</div>
                <div className="text-2xl font-bold text-blue-400">
                    {Math.round(summary.todayMinutes / 60 * 10) / 10} <span className="text-sm text-gray-500">h</span>
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
                <div className="text-gray-400 text-xs mb-1">Total Focus</div>
                <div className="text-2xl font-bold text-purple-400">
                    {Math.round(summary.totalFocusMinutes / 60 * 10) / 10} <span className="text-sm text-gray-500">h</span>
                </div>
            </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 p-4 rounded-xl h-64 mb-4">
            <h3 className="text-sm text-gray-400 mb-4">Last 7 Days (Minutes)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
