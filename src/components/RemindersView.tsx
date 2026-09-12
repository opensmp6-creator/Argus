import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  AlertCircle,
  Clock,
  Volume2,
  Calendar,
} from 'lucide-react';
import { ReminderItem } from '../types';
import { SoundFX } from '../utils/audio';

interface RemindersViewProps {
  reminders: ReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  setReminders,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newCategory, setNewCategory] = useState('System');
  const [isAlarm, setIsAlarm] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const categories = ['all', 'System', 'Containment', 'Smart Home', 'Admin', 'Privat'];

  const filteredReminders = reminders.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'completed'
        ? item.completed
        : !item.completed;
    return matchesCat && matchesStatus;
  });

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueTime.trim()) return;

    SoundFX.playConfirm();
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      dueTime: newDueTime.trim(),
      priority: newPriority,
      completed: false,
      isAlarm,
      category: newCategory,
    };

    setReminders((prev) => [newRem, ...prev]);
    setNewTitle('');
    setNewDueTime('');
  };

  const handleToggleComplete = (id: string) => {
    SoundFX.playConfirm();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDelete = (id: string) => {
    SoundFX.playToggle();
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              Erinnerungen & Zeitgesteuerte Audit-Alarme
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              ARGUS überwacht Termine, Fristen und Wartungspläne mit akustischer Signalisierung.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span>Offene Aufgaben:</span>
            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold border border-orange-500/30">
              {reminders.filter((r) => !r.completed).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Creator form + Reminders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Create Reminder Form */}
        <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4" />
            Neue Erinnerung erstellen
          </h3>

          <form onSubmit={handleAddReminder} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                Titel / Aufgabe
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="z.B. Backup-Server überprüfen..."
                className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                Fälligkeitszeitpunkt
              </label>
              <input
                type="text"
                required
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                placeholder="z.B. Heute 19:30 oder In 2 Stunden"
                className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                  Priorität
                </label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                >
                  <option value="low">Niedrig</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="critical">Kritisch</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                  Kategorie
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                >
                  <option value="System">System</option>
                  <option value="Containment">Containment</option>
                  <option value="Smart Home">Smart Home</option>
                  <option value="Admin">Admin</option>
                  <option value="Privat">Privat</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-alarm-sound"
                checked={isAlarm}
                onChange={(e) => setIsAlarm(e.target.checked)}
                className="accent-orange-500 rounded"
              />
              <label htmlFor="check-alarm-sound" className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                Akustischen Weckalarm aktivieren
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all uppercase tracking-wider"
            >
              Erinnerung Speichern
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Reminders List & Filter */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category & Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0d0d0d] border border-[#222]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    SoundFX.playToggle();
                    setFilterCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    filterCategory === cat
                      ? 'bg-orange-500 text-black font-bold'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
                  }`}
                >
                  {cat === 'all' ? 'Alle' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded border border-[#222] text-xs font-mono">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-0.5 rounded ${filterStatus === 'all' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'}`}
              >
                Alle
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2 py-0.5 rounded ${filterStatus === 'pending' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'}`}
              >
                Offen
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-2 py-0.5 rounded ${filterStatus === 'completed' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'}`}
              >
                Erledigt
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-3">
            {filteredReminders.length === 0 ? (
              <div className="p-8 text-center bg-[#0d0d0d] border border-[#222] rounded-lg text-gray-500 font-mono text-xs">
                Keine Erinnerungen in dieser Kategorie gefunden.
              </div>
            ) : (
              filteredReminders.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg bg-[#111] border transition-all flex items-start justify-between gap-3 ${
                    item.completed
                      ? 'border-[#222] opacity-50'
                      : item.priority === 'critical'
                      ? 'border-red-900/60'
                      : 'border-[#222] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className="mt-0.5 text-gray-500 hover:text-orange-400 transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    <div>
                      <h4
                        className={`text-xs font-semibold ${
                          item.completed ? 'line-through text-gray-600' : 'text-gray-200'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-gray-500">
                        <span className="flex items-center gap-1 text-orange-400">
                          <Clock className="w-3 h-3 text-orange-400" />
                          {item.dueTime}
                        </span>
                        <span>•</span>
                        <span className="text-gray-500">{item.category}</span>
                        {item.isAlarm && (
                          <span className="flex items-center gap-1 text-orange-400/90">
                            <Volume2 className="w-3 h-3" />
                            Alarm aktiv
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        item.priority === 'critical'
                          ? 'bg-red-950/80 border border-red-900/60 text-red-400'
                          : item.priority === 'high'
                          ? 'bg-orange-950/80 border border-orange-500/30 text-orange-400'
                          : 'bg-[#181818] text-gray-500'
                      }`}
                    >
                      {item.priority}
                    </span>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
