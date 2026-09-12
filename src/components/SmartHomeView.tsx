import React, { useState } from 'react';
import {
  Home,
  Lightbulb,
  Lock,
  Unlock,
  Thermometer,
  Camera,
  Zap,
  Sliders,
  Sparkles,
  ShieldAlert,
  Moon,
  Sun,
  Eye,
} from 'lucide-react';
import { SmartDevice } from '../types';
import { SoundFX } from '../utils/audio';

interface SmartHomeViewProps {
  devices: SmartDevice[];
  setDevices: React.Dispatch<React.SetStateAction<SmartDevice[]>>;
  onToggleDevice: (id: string) => void;
}

export const SmartHomeView: React.FC<SmartHomeViewProps> = ({
  devices,
  setDevices,
  onToggleDevice,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  const rooms = [
    'all',
    'Kommandozentrale',
    'Server-Rack',
    'Eingangsbereich',
    'Außenbereich',
    'Technikraum',
  ];

  const filteredDevices =
    selectedRoom === 'all'
      ? devices
      : devices.filter((d) => d.room === selectedRoom);

  const applyScene = (sceneName: string) => {
    SoundFX.playWakeChime();
    if (sceneName === 'cyber_amber') {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') {
            return {
              ...d,
              state: true,
              value: 90,
              colorHex: '#ff7700',
              statusText: '90% Helligkeit (Cyber-Amber)',
            };
          }
          if (d.type === 'lock') return { ...d, state: true, statusText: 'Verriegelt & Alarmbereitschaft' };
          return d;
        })
      );
    } else if (sceneName === 'red_alert') {
      SoundFX.playBreachAlarm();
      setDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') {
            return {
              ...d,
              state: true,
              value: 100,
              colorHex: '#ff0033',
              statusText: '100% Notfall-Rotlicht (Alarm)',
            };
          }
          if (d.type === 'lock') return { ...d, state: true, statusText: 'MAXIMAL VERRIEGELT' };
          return d;
        })
      );
    } else if (sceneName === 'night_stealth') {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') {
            return {
              ...d,
              state: false,
              value: 15,
              colorHex: '#ff7700',
              statusText: 'Ausgeschaltet (Nacht)',
            };
          }
          if (d.type === 'lock') return { ...d, state: true, statusText: 'Vollständig Verriegelt' };
          return d;
        })
      );
    } else if (sceneName === 'daylight') {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') {
            return {
              ...d,
              state: true,
              value: 80,
              colorHex: '#ffffff',
              statusText: '80% Tageslichtweiß 5000K',
            };
          }
          return d;
        })
      );
    }
  };

  const handleUpdateValue = (id: string, delta: number) => {
    SoundFX.playToggle();
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const current = d.value || 0;
          const updated = Math.max(0, Math.min(100, current + delta));
          return {
            ...d,
            value: updated,
            statusText: d.type === 'thermostat' ? `Sollwert ${updated.toFixed(1)}°C` : `${updated}% Helligkeit`,
          };
        }
        return d;
      })
    );
  };

  const handleSetColor = (id: string, colorHex: string) => {
    SoundFX.playToggle();
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return { ...d, colorHex, state: true };
        }
        return d;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Scene Presets Header */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Home className="w-4 h-4" />
              Smart Home & Gebäudeleitsystem
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Automatisierte Umgebungssteuerung, IoT-Relais und Sicherheitsbarrieren.
            </p>
          </div>

          {/* Quick Scene Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyScene('cyber_amber')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all shadow-[0_0_10px_#f97316]/40 uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Amber Szenario</span>
            </button>

            <button
              onClick={() => applyScene('red_alert')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 text-red-400 text-xs font-mono transition-all uppercase tracking-wider"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Alarm-Rotlicht</span>
            </button>

            <button
              onClick={() => applyScene('night_stealth')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-gray-400 hover:text-orange-400 text-xs font-mono transition-all uppercase tracking-wider"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Nacht-Modus</span>
            </button>

            <button
              onClick={() => applyScene('daylight')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-gray-400 hover:text-orange-400 text-xs font-mono transition-all uppercase tracking-wider"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Tageslicht</span>
            </button>
          </div>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => {
              SoundFX.playToggle();
              setSelectedRoom(room);
            }}
            className={`px-3.5 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
              selectedRoom === room
                ? 'bg-orange-500 text-black font-bold border border-orange-500'
                : 'bg-[#141414] text-gray-400 hover:text-gray-200 border border-[#222]'
            }`}
          >
            {room === 'all' ? 'Alle Räume' : room}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isLight = device.type === 'light';
          const isLock = device.type === 'lock';
          const isThermostat = device.type === 'thermostat';
          const isCamera = device.type === 'camera';
          const isSocket = device.type === 'socket';

          return (
            <div
              key={device.id}
              className={`p-5 rounded-lg bg-[#111] border transition-all ${
                device.state
                  ? 'border-orange-500/40'
                  : 'border-[#222] hover:border-[#333]'
              }`}
            >
              {/* Device Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded transition-all ${
                      device.state
                        ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                        : 'bg-[#181818] text-gray-600'
                    }`}
                    style={
                      isLight && device.state && device.colorHex
                        ? { borderColor: device.colorHex, color: device.colorHex }
                        : undefined
                    }
                  >
                    {isLight && <Lightbulb className="w-5 h-5" />}
                    {isLock && (device.state ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />)}
                    {isThermostat && <Thermometer className="w-5 h-5" />}
                    {isCamera && <Camera className="w-5 h-5" />}
                    {isSocket && <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {device.room}
                    </span>
                    <h3 className="text-xs font-semibold text-gray-200">{device.name}</h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    SoundFX.playToggle();
                    onToggleDevice(device.id);
                  }}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    device.state
                      ? 'bg-orange-500 text-black'
                      : 'bg-[#181818] border border-[#222] text-gray-500 hover:text-white'
                  }`}
                >
                  {isLock ? (device.state ? 'Verriegelt' : 'Entriegelt') : device.state ? 'AKTIV' : 'AUS'}
                </button>
              </div>

              {/* Camera Live Simulation View */}
              {isCamera && (
                <div className="relative my-3 rounded overflow-hidden border border-[#222] bg-black aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-scanlines opacity-50" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-green-400 border border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    LIVE 4K REC
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-orange-400 bg-black/80 px-2 py-0.5 rounded border border-orange-500/30">
                    CAM-01
                  </div>
                  <div className="relative z-10 text-center">
                    <Eye className="w-8 h-8 mx-auto text-orange-500/60 animate-pulse mb-1" />
                    <span className="text-[10px] font-mono text-gray-500">
                      Perimeter gesichert • KI-Bewegungssensor aktiv
                    </span>
                  </div>
                </div>
              )}

              {/* Light Controls: Dimmer & Cyber Palette */}
              {isLight && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Helligkeit:</span>
                    <span className="text-orange-400 font-semibold">{device.value || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateValue(device.id, -10)}
                      className="px-2.5 py-1 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-xs font-mono text-gray-400 hover:text-white"
                    >
                      -10%
                    </button>
                    <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${device.value || 0}%` }}
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateValue(device.id, 10)}
                      className="px-2.5 py-1 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-xs font-mono text-gray-400 hover:text-white"
                    >
                      +10%
                    </button>
                  </div>

                  {/* Color Preset Palette */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono text-gray-500">Farbe:</span>
                    {[
                      { hex: '#ff7700', label: 'Amber' },
                      { hex: '#ffaa00', label: 'Warm' },
                      { hex: '#ffffff', label: 'Weiß' },
                      { hex: '#ff0044', label: 'Rot' },
                      { hex: '#00f0ff', label: 'Cyan' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleSetColor(device.id, col.hex)}
                        title={col.label}
                        className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Thermostat Controls */}
              {isThermostat && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Zieltemperatur:</span>
                    <span className="text-orange-400 font-bold text-sm">
                      {(device.value || 21).toFixed(1)} °C
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleUpdateValue(device.id, -0.5)}
                      className="px-3 py-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-xs font-mono font-bold text-gray-300"
                    >
                      - 0.5°C
                    </button>
                    <button
                      onClick={() => handleUpdateValue(device.id, 0.5)}
                      className="px-3 py-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-xs font-mono font-bold text-gray-300"
                    >
                      + 0.5°C
                    </button>
                  </div>
                </div>
              )}

              {/* Status footer line */}
              <div className="mt-3 pt-2.5 border-t border-[#222] text-[10px] font-mono text-gray-500 flex items-center justify-between">
                <span>Status:</span>
                <span className="text-orange-400/90 font-medium truncate max-w-[200px]">
                  {device.statusText || (device.state ? 'Online & Überwacht' : 'Inaktiv')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
