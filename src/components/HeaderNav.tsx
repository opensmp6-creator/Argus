import React, { useEffect, useState } from 'react';
import {
  Shield,
  Monitor,
  Cpu,
  Home,
  Gamepad2,
  Bell,
  Eye,
  AlertTriangle,
  Users,
  Settings,
  Lock,
  Smartphone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ArgusSettings, SystemMetrics } from '../types';
import { SoundFX } from '../utils/audio';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: ArgusSettings;
  setSettings: React.Dispatch<React.SetStateAction<ArgusSettings>>;
  metrics: SystemMetrics;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isSpeaking: boolean;
  onLockPc: () => void;
  unreadNotifsCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  settings,
  setSettings,
  metrics,
  isListening,
  setIsListening,
  isSpeaking,
  onLockPc,
  unreadNotifsCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'dashboard', label: 'Übersicht', icon: Cpu },
    { id: 'apps', label: 'PC & Apps', icon: Monitor },
    { id: 'smarthome', label: 'Smart Home', icon: Home },
    { id: 'gaming', label: 'Discord & Minecraft', icon: Gamepad2 },
    { id: 'reminders', label: 'Erinnerungen', icon: Bell, badge: unreadNotifsCount },
    { id: 'biometrics', label: 'Biometrie & Schutz', icon: Eye },
    { id: 'scp', label: 'SCP-Containment', icon: AlertTriangle },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone },
    { id: 'admin', label: 'Admin & Wartung', icon: Users },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  const salutationLabel = settings.userName || 'Master';
  const politenessLabel = settings.addressForm === 'Sie' ? 'Siezen' : 'Duzen';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0d0d] border-b border-[#222] text-gray-400">
      {/* Top Telemetry & Header Bar */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-[#222]">
        {/* Left: Branding & App Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 bg-orange-500 rounded-sm flex items-center justify-center font-bold text-black text-xs shadow-[0_0_12px_#f97316]">
            A
          </div>
          <div>
            <h1 className="text-orange-500 font-bold tracking-[0.2em] uppercase text-base sm:text-lg flex items-center">
              Argus <span className="text-gray-600 font-normal text-xs ml-2 tracking-normal uppercase">Concept v1.0</span>
            </h1>
          </div>
        </div>

        {/* Center/Right: Voice Protocol, Local Telemetry & Quick Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Protocol info */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Voice Protocol</span>
            <span className="text-xs font-mono font-semibold text-orange-400">
              ACTIVE: {salutationLabel.toUpperCase()} ({politenessLabel.toUpperCase()})
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-8 bg-gray-800" />

          {/* Local clock & metrics */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500 font-mono">SYS_LOCAL: {timeStr}</p>
            <p className="text-[10px] text-orange-500 font-mono">
              CPU: {metrics.cpuUsage}% | GPU: {metrics.gpuTemp}°C
            </p>
          </div>

          <div className="hidden sm:block w-[1px] h-8 bg-gray-800" />

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            {/* Wake Word Status Button */}
            <button
              id="btn-toggle-wake-word"
              onClick={() => {
                SoundFX.playToggle();
                setIsListening(!isListening);
              }}
              title={isListening ? 'Aktivierung "Hey Argus" aktiv' : 'Sprachaktivierung pausiert'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                isListening
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/40 shadow-amber-glow'
                  : 'bg-[#141414] text-gray-500 border border-[#222] hover:text-gray-300'
              }`}
            >
              {isListening ? <Mic className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> : <MicOff className="w-3.5 h-3.5 text-gray-500" />}
              <span className="hidden lg:inline">"Hey Argus"</span>
            </button>

            {/* Speech Audio Output Toggle */}
            <button
              id="btn-toggle-speech-synth"
              onClick={() => {
                SoundFX.playToggle();
                setSettings((prev) => ({
                  ...prev,
                  voiceEnabled: !prev.voiceEnabled,
                }));
              }}
              title={settings.voiceEnabled ? 'Sprachausgabe aktiv' : 'Sprachausgabe stumm'}
              className="p-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500/40 text-gray-400 hover:text-orange-400 transition-colors"
            >
              {settings.voiceEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-gray-600" />
              )}
            </button>

            {/* Lock PC Button */}
            <button
              id="btn-lock-pc-header"
              onClick={() => {
                SoundFX.playLock();
                onLockPc();
              }}
              title="PC & Terminal sofort sperren"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-950/40 border border-orange-900/60 hover:bg-orange-900/60 text-orange-400 hover:text-orange-300 transition-all font-mono text-xs"
            >
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Sperren</span>
            </button>

            {/* Settings Button */}
            <button
              id="btn-open-settings"
              onClick={() => {
                SoundFX.playConfirm();
                setActiveTab('settings');
              }}
              title="ARGUS Konfiguration & Datenschutz"
              className={`p-1.5 rounded border transition-colors ${
                activeTab === 'settings'
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-amber-glow'
                  : 'bg-[#141414] border-[#222] hover:border-orange-500/40 text-gray-400 hover:text-orange-400'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="flex items-center gap-1 px-4 sm:px-8 py-2 overflow-x-auto no-scrollbar bg-[#0a0a0a] border-b border-[#222]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                SoundFX.playConfirm();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500/10 border-l-2 border-orange-500 text-orange-400 font-semibold shadow-amber-glow'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#111] border-l-2 border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-orange-500 text-black font-bold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
