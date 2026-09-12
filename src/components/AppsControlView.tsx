import React, { useState } from 'react';
import {
  Monitor,
  Play,
  Square,
  RotateCw,
  Plus,
  Lock,
  Power,
  Moon,
  Trash2,
  Sliders,
  Cpu,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { AppItem } from '../types';
import { SoundFX } from '../utils/audio';

interface AppsControlViewProps {
  apps: AppItem[];
  setApps: React.Dispatch<React.SetStateAction<AppItem[]>>;
  onLockPc: () => void;
  onLaunchApp: (id: string) => void;
  onStopApp: (id: string) => void;
}

export const AppsControlView: React.FC<AppsControlViewProps> = ({
  apps,
  setApps,
  onLockPc,
  onLaunchApp,
  onStopApp,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPath, setNewAppPath] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'development' | 'gaming' | 'system' | 'communication' | 'media'>('development');

  const filteredApps =
    selectedCategory === 'all'
      ? apps
      : apps.filter((a) => a.category === selectedCategory);

  const handleAddNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppPath.trim()) return;

    SoundFX.playConfirm();
    const newApp: AppItem = {
      id: `app-${Date.now()}`,
      name: newAppName,
      icon: 'Layers',
      category: newAppCategory,
      status: 'stopped',
      cpuUsage: 0,
      ramUsageMb: 0,
      path: newAppPath,
    };

    setApps((prev) => [...prev, newApp]);
    setNewAppName('');
    setNewAppPath('');
    setIsAddModalOpen(false);
  };

  const handleRestartApp = (app: AppItem) => {
    SoundFX.playConfirm();
    onStopApp(app.id);
    setTimeout(() => {
      onLaunchApp(app.id);
    }, 600);
  };

  const handleDeleteApp = (id: string) => {
    SoundFX.playToggle();
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* PC Power & System Control Center */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Monitor className="w-4 h-4" />
              Zentrale PC- & Hardware-Steuerung
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Direkte Betriebssystem-Befehle, Prozessprioritäten und Ausführungsrechte verwalten.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                SoundFX.playLock();
                onLockPc();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs font-bold transition-all shadow-[0_0_10px_#f97316]/40 uppercase tracking-wider"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>PC Sperren</span>
            </button>

            <button
              onClick={() => {
                SoundFX.playConfirm();
                alert('ARGUS: Energiesparmodus / Ruhezustand an das Mainboard gesendet (Simuliert).');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#141414] border border-[#222] hover:border-orange-500/40 text-gray-400 hover:text-orange-400 font-mono text-xs transition-all"
            >
              <Moon className="w-3.5 h-3.5 text-orange-400" />
              <span>Ruhezustand</span>
            </button>

            <button
              onClick={() => {
                SoundFX.playAlert();
                const confirmShutdown = window.confirm(
                  'Möchten Sie den PC wirklich herunterfahren? Alle ungespeicherten Prozesse werden beendet.'
                );
                if (confirmShutdown) {
                  alert('ARGUS: Herunterfahren eingeleitet. ACPI Power-Off Signal gesendet.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 text-red-400 font-mono text-xs transition-all"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Herunterfahren</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Ribbon & Add App Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Alle Programme' },
            { id: 'development', label: 'Entwicklung & Tools' },
            { id: 'gaming', label: 'Gaming & Server' },
            { id: 'communication', label: 'Kommunikation' },
            { id: 'system', label: 'System & Shell' },
            { id: 'media', label: 'Medien & Browser' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                SoundFX.playToggle();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-black font-bold border border-orange-500'
                  : 'bg-[#141414] text-gray-400 hover:text-gray-200 border border-[#222]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            SoundFX.playConfirm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500/50 text-orange-400 text-xs font-mono font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Programm hinzufügen</span>
        </button>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className={`p-5 rounded-lg bg-[#111] border transition-all ${
              app.status === 'running'
                ? 'border-orange-500/40'
                : 'border-[#222] hover:border-[#333]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded ${
                    app.status === 'running'
                      ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                      : 'bg-[#181818] text-gray-600'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-200">{app.name}</h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">
                    {app.category}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  app.status === 'running'
                    ? 'bg-green-950/80 text-green-400 border border-green-500/30'
                    : app.status === 'suspended'
                    ? 'bg-orange-950/60 text-orange-400 border border-orange-500/30'
                    : 'bg-[#181818] text-gray-500'
                }`}
              >
                {app.status === 'running' ? 'LÄUFT' : app.status === 'suspended' ? 'STANDBY' : 'BEENDET'}
              </span>
            </div>

            {/* Path and Specs */}
            <div className="p-2.5 rounded bg-[#141414] border border-[#222] text-[10px] font-mono text-gray-500 space-y-1 mb-4">
              <div className="truncate">Pfad: {app.path}</div>
              <div className="flex items-center justify-between text-orange-400/90">
                <span>CPU: {app.cpuUsage}%</span>
                <span>RAM: {app.ramUsageMb} MB</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#222]">
              <div className="flex items-center gap-2">
                {app.status === 'running' ? (
                  <>
                    <button
                      onClick={() => {
                        SoundFX.playToggle();
                        onStopApp(app.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 text-red-400 text-xs font-mono transition-all"
                      title="Prozess sofort beenden"
                    >
                      <Square className="w-3 h-3" />
                      <span>Schließen</span>
                    </button>
                    <button
                      onClick={() => handleRestartApp(app)}
                      className="p-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-gray-400 hover:text-orange-400 transition-all"
                      title="Neu starten"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      SoundFX.playConfirm();
                      onLaunchApp(app.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Starten</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDeleteApp(app.id)}
                className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors"
                title="Aus Schnellstart entfernen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add New Program */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-lg bg-[#0d0d0d] border border-[#222]">
            <h3 className="text-sm font-mono font-bold text-orange-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              Neues Programm registrieren
            </h3>

            <form onSubmit={handleAddNewApp} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Programm-Name
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="z.B. Unreal Engine 5 oder Python Bot"
                  className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Ausführungspfad / Befehl
                </label>
                <input
                  type="text"
                  required
                  value={newAppPath}
                  onChange={(e) => setNewAppPath(e.target.value)}
                  placeholder="z.B. C:/Tools/app.exe oder python main.py"
                  className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Kategorie
                </label>
                <select
                  value={newAppCategory}
                  onChange={(e: any) => setNewAppCategory(e.target.value)}
                  className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                >
                  <option value="development">Entwicklung & Tools</option>
                  <option value="gaming">Gaming & Server</option>
                  <option value="communication">Kommunikation</option>
                  <option value="system">System & Shell</option>
                  <option value="media">Medien & Browser</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#141414] border border-[#222] text-gray-400 hover:text-white text-xs font-mono"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
