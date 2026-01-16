import { useEffect, useState } from 'react';
import { getStorage, setStorage, Settings } from '../storage';
import { Volume2, VolumeX, Moon, Sun, ShieldAlert, Ban, Plus, X } from 'lucide-react';

export function SettingsView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    getStorage().then(s => setSettings(s.settings));
  }, []);

  const updateSetting = async (key: keyof Settings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await setStorage({ settings: newSettings });
  };

  const addBlockedSite = async () => {
    if (!settings || !newSite.trim()) return;
    const updatedSites = [...settings.blockedSites, newSite.trim().toLowerCase()];
    await updateSetting('blockedSites', updatedSites);
    setNewSite('');
  };

  const removeBlockedSite = async (siteToRemove: string) => {
    if (!settings) return;
    const updatedSites = settings.blockedSites.filter(site => site !== siteToRemove);
    await updateSetting('blockedSites', updatedSites);
  };

  if (!settings) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900 text-white overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        
        {/* Timer Durations */}
        <section className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Timer Durations (min)</h3>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Focus</label>
                    <input 
                        type="number" 
                        value={settings.focusDuration}
                        onChange={(e) => updateSetting('focusDuration', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-center focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Short Break</label>
                    <input 
                        type="number" 
                        value={settings.shortBreakDuration}
                        onChange={(e) => updateSetting('shortBreakDuration', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-center focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Long Break</label>
                    <input 
                        type="number" 
                        value={settings.longBreakDuration}
                        onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-center focus:border-blue-500 outline-none"
                    />
                </div>
            </div>
        </section>

        {/* Preferences */}
        <section className="bg-gray-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Preferences</h3>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-gray-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                    <span>Sound Notifications</span>
                </div>
                <button 
                    onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-gray-400" />
                    <span>Auto-start Breaks</span>
                </div>
                <button 
                    onClick={() => updateSetting('autoStartBreaks', !settings.autoStartBreaks)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoStartBreaks ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.autoStartBreaks ? 'translate-x-6' : ''}`} />
                </button>
            </div>
            
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-gray-400" />
                    <span>Auto-start Pomodoros</span>
                </div>
                <button 
                    onClick={() => updateSetting('autoStartPomos', !settings.autoStartPomos)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoStartPomos ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.autoStartPomos ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        </section>

        {/* Strict Mode */}
        <section className="bg-gray-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Strict Mode
            </h3>
            
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                    Block websites during focus
                </div>
                <button 
                    onClick={() => updateSetting('strictMode', !settings.strictMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.strictMode ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.strictMode ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            {settings.strictMode && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={newSite}
                            onChange={(e) => setNewSite(e.target.value)}
                            placeholder="example.com"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-500"
                            onKeyDown={(e) => e.key === 'Enter' && addBlockedSite()}
                        />
                        <button 
                            onClick={addBlockedSite}
                            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {settings.blockedSites.map(site => (
                            <div key={site} className="flex items-center justify-between bg-gray-900/50 px-3 py-2 rounded text-sm group">
                                <span className="flex items-center gap-2">
                                    <Ban className="w-3 h-3 text-red-400" />
                                    {site}
                                </span>
                                <button 
                                    onClick={() => removeBlockedSite(site)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
      </div>
    </div>
  );
}
