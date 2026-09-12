import React, { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Radio,
  FileText,
  Flame,
  Zap,
  Activity,
  Layers,
  Search,
  CheckCircle,
} from 'lucide-react';
import { ScpItem, ScpClass } from '../types';
import { SoundFX } from '../utils/audio';

interface ScpContainmentViewProps {
  scpItems: ScpItem[];
  setScpItems: React.Dispatch<React.SetStateAction<ScpItem[]>>;
  onTriggerBreachAlert: (scp: ScpItem) => void;
}

export const ScpContainmentView: React.FC<ScpContainmentViewProps> = ({
  scpItems,
  setScpItems,
  onTriggerBreachAlert,
}) => {
  const [selectedScpId, setSelectedScpId] = useState<string>('SCP-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');

  const selectedScp = scpItems.find((s) => s.id === selectedScpId) || scpItems[0];

  const filteredScps = scpItems.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || item.itemClass === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleSimulateBreach = (scpId: string) => {
    SoundFX.playBreachAlarm();
    const targetScp = scpItems.find((s) => s.id === scpId);
    if (!targetScp) return;

    setScpItems((prev) =>
      prev.map((s) =>
        s.id === scpId ? { ...s, containmentStatus: 'Breached' } : s
      )
    );

    onTriggerBreachAlert(targetScp);
  };

  const handleExecuteLockdown = (scpId: string) => {
    SoundFX.playConfirm();
    setScpItems((prev) =>
      prev.map((s) =>
        s.id === scpId ? { ...s, containmentStatus: 'Contained' } : s
      )
    );
    alert(`ARGUS Containment: Notfall-Protokoll für ${scpId} ausgeführt. Schwere Panzertüren verriegelt und Zelle neutralisiert.`);
  };

  const handleLockdownAllSectors = () => {
    SoundFX.playBreachAlarm();
    setScpItems((prev) =>
      prev.map((s) => ({ ...s, containmentStatus: 'Protocol Active' }))
    );
    setTimeout(() => {
      setScpItems((prev) =>
        prev.map((s) => ({ ...s, containmentStatus: 'Contained' }))
      );
    }, 2000);
    alert('ARGUS: Globales Site-19 Eindämmungsprotokoll OMEGA aktiviert. Alle Sektoren unter maximaler Abriegelung.');
  };

  const getClassBadgeStyle = (itemClass: ScpClass) => {
    switch (itemClass) {
      case 'Safe':
        return 'bg-[#141414] text-green-400 border border-green-500/30';
      case 'Euclid':
        return 'bg-[#141414] text-orange-400 border border-orange-500/30';
      case 'Keter':
        return 'bg-red-950/60 text-red-300 border border-red-800/60 font-bold';
      case 'Thaumiel':
        return 'bg-purple-950/60 text-purple-300 border border-purple-800/50';
      case 'Apollyon':
        return 'bg-black text-red-400 border border-red-700 font-extrabold';
      default:
        return 'bg-[#141414] text-gray-400 border border-[#222]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Global Lockdown Action */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            <h2 className="text-sm font-mono font-bold text-orange-400 uppercase tracking-wider">
              SCP Foundation Site-19 Eindämmungssystem (Fiktiv)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            ARGUS überwacht paranormale, biologische und raumzeitliche Anomalien in Echtzeit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLockdownAllSectors}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-red-950/60 border border-red-900/80 hover:bg-red-900/60 text-red-200 font-mono text-xs font-bold transition-all uppercase tracking-wider"
          >
            <Lock className="w-4 h-4 text-red-400" />
            <span>Site-19 Notfall-Abriegelung</span>
          </button>
        </div>
      </div>

      {/* Main Database Layout: List / Filter + Deep Dossier Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: SCP List & Filter */}
        <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-col space-y-3">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SCP-Nummer oder Name suchen..."
                className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded pl-8 pr-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {['all', 'Safe', 'Euclid', 'Keter', 'Thaumiel'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    SoundFX.playToggle();
                    setFilterClass(cls);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                    filterClass === cls
                      ? 'bg-orange-500 text-black font-bold'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
                  }`}
                >
                  {cls === 'all' ? 'Alle' : cls}
                </button>
              ))}
            </div>
          </div>

          {/* List of SCP Items */}
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredScps.map((item) => {
              const isSelected = item.id === selectedScpId;
              const isBreached = item.containmentStatus === 'Breached';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    SoundFX.playConfirm();
                    setSelectedScpId(item.id);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#181818] border-orange-500/80'
                      : 'bg-[#111] border-[#222] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-orange-400">
                          {item.id}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${getClassBadgeStyle(
                            item.itemClass
                          )}`}
                        >
                          {item.itemClass}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-200 mt-1 line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                        {item.sector}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                        isBreached
                          ? 'bg-red-950 text-red-300 font-bold border border-red-800'
                          : 'bg-[#181818] text-green-400 border border-[#222]'
                      }`}
                    >
                      {item.containmentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Deep Dossier & Containment Controls */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-col space-y-4">
          {/* Dossier Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#222]">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-mono font-bold text-orange-400">
                  {selectedScp.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono ${getClassBadgeStyle(
                    selectedScp.itemClass
                  )}`}
                >
                  OBJEKTKLASSE: {selectedScp.itemClass.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#141414] border border-[#222] text-gray-400">
                  BEDROHUNG: {selectedScp.threatLevel}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-100 mt-1">{selectedScp.name}</h3>
              <p className="text-xs font-mono text-gray-500 mt-0.5">
                Standort: {selectedScp.sector} • Autorisierungs-Code: {selectedScp.lockdownCode}
              </p>
            </div>

            {/* Breach Simulator & Lockdown Action */}
            <div className="flex items-center gap-2">
              {selectedScp.containmentStatus === 'Breached' ? (
                <button
                  onClick={() => handleExecuteLockdown(selectedScp.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4" />
                  <span>Eindämmung Wiederherstellen</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSimulateBreach(selectedScp.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded bg-red-950/60 border border-red-900/80 hover:bg-red-900/60 text-red-200 text-xs font-mono font-bold transition-all uppercase tracking-wider"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Durchbruch simulieren</span>
                </button>
              )}
            </div>
          </div>

          {/* Breach Alert Warning Banner if Breached */}
          {selectedScp.containmentStatus === 'Breached' && (
            <div className="p-3.5 rounded bg-red-950/90 border border-red-800 text-white text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <span className="font-bold text-sm">CONTAINMENT BREACH IN {selectedScp.sector}!</span>
                  <p className="text-[11px] text-red-200 mt-0.5">
                    Subjekt hat Sicherheitsbarrieren überwunden. Mobiles Einsatzkommando (MTF) alarmiert.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dossier Content Tabs */}
          <div className="space-y-4 text-xs font-mono">
            {/* Description */}
            <div className="p-4 rounded bg-[#141414] border border-[#222]">
              <h4 className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Beschreibung des Objekts
              </h4>
              <p className="text-gray-300 leading-relaxed">{selectedScp.description}</p>
            </div>

            {/* Special Containment Procedures */}
            <div className="p-4 rounded bg-[#141414] border border-[#222]">
              <h4 className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                Spezielle Eindämmungsmaßnahmen (S.C.P.)
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {selectedScp.specialContainmentProcedures}
              </p>
            </div>

            {/* Incident History */}
            <div className="p-4 rounded bg-[#141414] border border-[#222]">
              <h4 className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                Vorfallsprotokoll & Audit
              </h4>
              <p className="text-gray-500 italic">{selectedScp.incidentHistory}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
