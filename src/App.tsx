import React, { useState, useEffect } from 'react';
import {
  ArgusSettings,
  SystemMetrics,
  AppItem,
  SmartDevice,
  DiscordState,
  MinecraftState,
  ReminderItem,
  BiometricProfile,
  ScpItem,
  PushNotification,
  AdminInviteCode,
  RemoteMaintenanceSession,
  AuditLogEntry,
  CommandAction,
  VoiceDialogueTurn,
} from './types';
import {
  initialSettings,
  initialMetrics,
  initialApps,
  initialDevices,
  initialDiscord,
  initialMinecraft,
  initialReminders,
  initialBiometrics,
  initialScpItems,
  initialNotifications,
  initialInviteCodes,
  initialRemoteSession,
  initialAuditLogs,
} from './data/initialData';
import { SoundFX } from './utils/audio';

// Components
import { HeaderNav } from './components/HeaderNav';
import { VoiceAssistantWidget } from './components/VoiceAssistantWidget';
import { DashboardView } from './components/DashboardView';
import { AppsControlView } from './components/AppsControlView';
import { SmartHomeView } from './components/SmartHomeView';
import { GamingServerView } from './components/GamingServerView';
import { RemindersView } from './components/RemindersView';
import { BiometricsSecurityView } from './components/BiometricsSecurityView';
import { ScpContainmentView } from './components/ScpContainmentView';
import { MobileCompanionView } from './components/MobileCompanionView';
import { AdminOwnerView } from './components/AdminOwnerView';
import { SettingsView } from './components/SettingsView';

import { Lock, Eye } from 'lucide-react';

export function App() {
  // Global State with LocalStorage fallbacks
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [settings, setSettings] = useState<ArgusSettings>(() => {
    try {
      const saved = localStorage.getItem('argus_settings');
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);
  const [apps, setApps] = useState<AppItem[]>(initialApps);

  const [devices, setDevices] = useState<SmartDevice[]>(() => {
    try {
      const saved = localStorage.getItem('argus_devices');
      return saved ? JSON.parse(saved) : initialDevices;
    } catch {
      return initialDevices;
    }
  });

  const [discord, setDiscord] = useState<DiscordState>(initialDiscord);
  const [minecraft, setMinecraft] = useState<MinecraftState>(initialMinecraft);

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('argus_reminders');
      return saved ? JSON.parse(saved) : initialReminders;
    } catch {
      return initialReminders;
    }
  });

  const [biometrics, setBiometrics] = useState<BiometricProfile>(() => {
    try {
      const saved = localStorage.getItem('argus_biometrics');
      return saved ? JSON.parse(saved) : initialBiometrics;
    } catch {
      return initialBiometrics;
    }
  });

  const [scpItems, setScpItems] = useState<ScpItem[]>(initialScpItems);
  const [notifications, setNotifications] = useState<PushNotification[]>(initialNotifications);
  const [inviteCodes, setInviteCodes] = useState<AdminInviteCode[]>(initialInviteCodes);
  const [remoteSession, setRemoteSession] = useState<RemoteMaintenanceSession | null>(
    initialRemoteSession
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  
  // Voice & Assistant State
  const [dialogueHistory, setDialogueHistory] = useState<VoiceDialogueTurn[]>([]);
  const [isListening, setIsListening] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Lock Screen State
  const [isPcLocked, setIsPcLocked] = useState<boolean>(false);
  const [unlockPin, setUnlockPin] = useState<string>('');

  // Persist State Changes
  useEffect(() => {
    try {
      localStorage.setItem('argus_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('argus_devices', JSON.stringify(devices));
    } catch {}
  }, [devices]);

  useEffect(() => {
    try {
      localStorage.setItem('argus_reminders', JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem('argus_biometrics', JSON.stringify(biometrics));
    } catch {}
  }, [biometrics]);

  // Live Metrics Telemetry Fluctuation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.max(12, Math.min(88, prev.cpuUsage + Math.floor(Math.random() * 7 - 3))),
        gpuUsage: Math.max(10, Math.min(95, prev.gpuUsage + Math.floor(Math.random() * 5 - 2))),
        cpuTemp: Math.max(42, Math.min(68, prev.cpuTemp + Math.floor(Math.random() * 3 - 1))),
        networkDownloadMbps: Number((24.5 + Math.random() * 8).toFixed(1)),
        networkUploadMbps: Number((8.2 + Math.random() * 3).toFixed(1)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // System Lock Action
  const handleLockPc = () => {
    SoundFX.playLock();
    setIsPcLocked(true);
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('de-DE'),
        actor: 'ARGUS Security Subsystem',
        role: 'System',
        action: 'PC_LOCKED',
        details: 'Terminal-Sperre aktiviert. Biometrie oder Sicherheitspin erforderlich.',
        severity: 'security',
      },
      ...prev,
    ]);
  };

  // System Unlock Action
  const handleUnlockPc = () => {
    SoundFX.playConfirm();
    setIsPcLocked(false);
    setUnlockPin('');
  };

  // Launch App
  const handleLaunchApp = (id: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'running',
              cpuUsage: Math.floor(Math.random() * 8 + 2),
              ramUsageMb: Math.floor(Math.random() * 400 + 200),
            }
          : a
      )
    );
  };

  // Stop App
  const handleStopApp = (id: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'stopped', cpuUsage: 0, ramUsageMb: 0 }
          : a
      )
    );
  };

  // Toggle Smart Device
  const handleToggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, state: !d.state } : d))
    );
  };

  // Send Push Notification helper
  const handleSendPushNotification = (notif: PushNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  // SCP Breach Trigger
  const handleTriggerBreachAlert = (scp: ScpItem) => {
    SoundFX.playBreachAlarm();
    handleSendPushNotification({
      id: `notif-scp-${Date.now()}`,
      title: `🚨 SCP BREACH: ${scp.id}!`,
      message: `${scp.name} hat die Eindämmung in ${scp.sector} durchbrochen!`,
      type: 'scp',
      timestamp: 'Gerade eben',
      read: false,
      urgent: true,
    });

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('de-DE'),
        actor: 'Containment Sensor Array',
        role: 'System',
        action: 'SCP_BREACH_DETECTED',
        details: `Kritischer Sicherheitsdurchbruch: ${scp.id} (${scp.name}) in ${scp.sector}.`,
        severity: 'critical',
      },
      ...prev,
    ]);
  };

  // Command Execution Dispatcher (called by AI Voice / Text Assistant)
  const handleExecuteCommandAction = (action: CommandAction) => {
    console.log('[ARGUS DISPATCHER] Executing action:', action);

    switch (action.type) {
      case 'LOCK_PC':
        handleLockPc();
        break;

      case 'OPEN_APP':
      case 'LAUNCH_APP':
        if (action.target) {
          const matchApp = apps.find(
            (a) =>
              a.id === action.target ||
              a.name.toLowerCase().includes(action.target!.toLowerCase())
          );
          if (matchApp) handleLaunchApp(matchApp.id);
        }
        break;

      case 'CLOSE_APP':
      case 'STOP_APP':
        if (action.target) {
          const matchApp = apps.find(
            (a) =>
              a.id === action.target ||
              a.name.toLowerCase().includes(action.target!.toLowerCase())
          );
          if (matchApp) handleStopApp(matchApp.id);
        }
        break;

      case 'SMART_HOME_TOGGLE':
      case 'TOGGLE_SMART_DEVICE':
        if (action.target) {
          const matchDev = devices.find(
            (d) =>
              d.id === action.target ||
              d.name.toLowerCase().includes(action.target!.toLowerCase())
          );
          if (matchDev) {
            setDevices((prev) =>
              prev.map((d) =>
                d.id === matchDev.id
                  ? {
                      ...d,
                      state:
                        action.value !== undefined
                          ? Boolean(action.value)
                          : !d.state,
                    }
                  : d
              )
            );
          }
        }
        break;

      case 'SMART_HOME_SCENE':
        if (action.value) {
          const colorHex = action.value === 'red_alert' ? '#ff0033' : '#ff7700';
          setDevices((prev) =>
            prev.map((d) =>
              d.type === 'light'
                ? { ...d, state: true, colorHex, value: 100 }
                : d
            )
          );
        }
        break;

      case 'MINECRAFT_COMMAND':
        if (action.value) {
          setMinecraft((prev) => ({
            ...prev,
            consoleLogs: [
              ...prev.consoleLogs,
              `[${new Date().toLocaleTimeString('de-DE')} AI-RCON]: ${action.value}`,
            ],
          }));
        }
        break;

      case 'DISCORD_ANNOUNCE':
        if (action.value) {
          setDiscord((prev) => ({
            ...prev,
            recentAnnouncements: [
              {
                id: `ann-${Date.now()}`,
                text: String(action.value),
                channel: '📢-system-status',
                timestamp: 'Gerade eben',
                author: 'ARGUS AI',
              },
              ...prev.recentAnnouncements,
            ],
          }));
        }
        break;

      case 'ADD_REMINDER':
      case 'SET_REMINDER':
        if (action.value) {
          setReminders((prev) => [
            {
              id: `rem-${Date.now()}`,
              title: String(action.value),
              dueTime: 'Heute',
              priority: 'medium',
              completed: false,
              isAlarm: true,
              category: 'System',
            },
            ...prev,
          ]);
        }
        break;

      case 'SCP_LOCKDOWN':
      case 'TRIGGER_CONTAINMENT_LOCKDOWN':
        setScpItems((prev) =>
          prev.map((s) => ({ ...s, containmentStatus: 'Contained' }))
        );
        SoundFX.playConfirm();
        break;

      case 'NAVIGATE':
        if (action.target) {
          setActiveTab(action.target);
        }
        break;

      default:
        break;
    }
  };

  // Context payload for AI reasoning
  const currentContext = {
    settings,
    metrics,
    activeApps: apps.filter((a) => a.status === 'running').map((a) => a.name),
    devices: devices.map((d) => ({ name: d.name, state: d.state, room: d.room })),
    minecraft: {
      status: minecraft.status,
      players: minecraft.onlinePlayers,
      tps: minecraft.tps,
    },
    discord: {
      guild: discord.guildName,
      online: discord.onlineMembers,
    },
    scpSummary: scpItems.map((s) => ({ id: s.id, status: s.containmentStatus })),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* LOCKED SCREEN OVERLAY */}
      {isPcLocked && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded bg-orange-500/10 border border-orange-500 flex items-center justify-center text-orange-500 mb-4 shadow-[0_0_20px_#f97316]/30">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-mono font-bold tracking-[0.2em] uppercase text-orange-400">
            Terminal Gesperrt • Argus Core
          </h2>
          <p className="text-xs font-mono text-gray-500 mt-1 max-w-sm">
            Biometrischer Scan erforderlich oder Master-Sicherheits-PIN eingeben.
          </p>

          {/* Quick PIN or Face ID Unlock */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-xs">
            <input
              type="password"
              value={unlockPin}
              onChange={(e) => setUnlockPin(e.target.value)}
              placeholder="PIN eingeben (z.B. 1234)..."
              className="w-full bg-[#111] border border-[#222] focus:border-orange-500 rounded px-4 py-2.5 text-center text-sm font-mono text-gray-200 tracking-widest focus:outline-none"
            />

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleUnlockPc}
                className="flex-1 py-2.5 rounded bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs font-bold transition-all shadow-[0_0_12px_#f97316]/40 uppercase tracking-wider"
              >
                PIN Entsperren
              </button>

              <button
                onClick={handleUnlockPc}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded bg-[#111] border border-[#222] hover:border-orange-500 text-orange-400 font-mono text-xs transition-all"
                title="Face-ID Biometrie Unlock"
              >
                <Eye className="w-4 h-4" />
                <span>Face ID</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header & Navigation Bar */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        metrics={metrics}
        isListening={isListening}
        setIsListening={setIsListening}
        isSpeaking={isSpeaking}
        onLockPc={handleLockPc}
        unreadNotifsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Dynamic View Router */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <DashboardView
                metrics={metrics}
                apps={apps}
                smartDevices={devices}
                scpItems={scpItems}
                reminders={reminders}
                notifications={notifications}
                onLockPc={handleLockPc}
                onNavigateTab={setActiveTab}
                onToggleDevice={handleToggleDevice}
              />
            </div>
            <div className="lg:col-span-4 h-full min-h-[500px]">
              <VoiceAssistantWidget
                settings={settings}
                dialogueHistory={dialogueHistory}
                setDialogueHistory={setDialogueHistory}
                isListening={isListening}
                setIsListening={setIsListening}
                isSpeaking={isSpeaking}
                setIsSpeaking={setIsSpeaking}
                onExecuteCommandAction={handleExecuteCommandAction}
                contextState={currentContext}
              />
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <AppsControlView
            apps={apps}
            setApps={setApps}
            onLockPc={handleLockPc}
            onLaunchApp={handleLaunchApp}
            onStopApp={handleStopApp}
          />
        )}

        {activeTab === 'smarthome' && (
          <SmartHomeView
            devices={devices}
            setDevices={setDevices}
            onToggleDevice={handleToggleDevice}
          />
        )}

        {activeTab === 'gaming' && (
          <GamingServerView
            discord={discord}
            setDiscord={setDiscord}
            minecraft={minecraft}
            setMinecraft={setMinecraft}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            setReminders={setReminders}
          />
        )}

        {activeTab === 'biometrics' && (
          <BiometricsSecurityView
            biometrics={biometrics}
            setBiometrics={setBiometrics}
            onLockPc={handleLockPc}
            onSendPushNotification={handleSendPushNotification}
            userName={settings.userName}
          />
        )}

        {activeTab === 'scp' && (
          <ScpContainmentView
            scpItems={scpItems}
            setScpItems={setScpItems}
            onTriggerBreachAlert={handleTriggerBreachAlert}
          />
        )}

        {activeTab === 'mobile' && (
          <MobileCompanionView
            metrics={metrics}
            notifications={notifications}
            setNotifications={setNotifications}
            onLockPc={handleLockPc}
            devices={devices}
            onToggleDevice={handleToggleDevice}
            scpItems={scpItems}
            userName={settings.userName}
            onExecuteCommandAction={handleExecuteCommandAction}
          />
        )}

        {activeTab === 'admin' && (
          <AdminOwnerView
            inviteCodes={inviteCodes}
            setInviteCodes={setInviteCodes}
            remoteSession={remoteSession}
            setRemoteSession={setRemoteSession}
            auditLogs={auditLogs}
            setAuditLogs={setAuditLogs}
            userName={settings.userName}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>

      {/* Persistent Dock Assistant if not on dashboard */}
      {activeTab !== 'dashboard' && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full shadow-2xl hidden md:block">
          <div className="h-[380px]">
            <VoiceAssistantWidget
              settings={settings}
              dialogueHistory={dialogueHistory}
              setDialogueHistory={setDialogueHistory}
              isListening={isListening}
              setIsListening={setIsListening}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
              onExecuteCommandAction={handleExecuteCommandAction}
              contextState={currentContext}
            />
          </div>
        </div>
      )}

      {/* Elegant Dark System Footer */}
      <footer className="h-12 bg-[#0d0d0d] border-t border-[#222] flex items-center justify-between px-6 sm:px-8 text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">
        <div className="flex items-center gap-6 sm:gap-8">
          <span>Protocol: AES-256 Enabled</span>
          <span className="hidden sm:inline">Privacy Mode: ON</span>
        </div>
        <div className="flex items-center gap-6 sm:gap-8">
          <span className="text-orange-600/80 hidden md:inline">Warning: Unauthorized access is logged</span>
          <span className="text-gray-500">Argus OS v1.0.4 - Build 4920</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
