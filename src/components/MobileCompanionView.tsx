import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Shield,
  Bell,
  Cpu,
  Monitor,
  Lock,
  Lightbulb,
  Power,
  RotateCw,
  Eye,
  CheckCircle2,
  Trash2,
  Send,
  Zap,
  Sliders,
  QrCode,
  Globe,
  Radio,
  Wifi,
  Copy,
  Check,
  Camera,
  Flame,
  Volume2,
  Mic,
  AlertTriangle,
} from 'lucide-react';
import {
  SystemMetrics,
  PushNotification,
  ScpItem,
  SmartDevice,
  CommandAction,
} from '../types';
import { SoundFX } from '../utils/audio';
import { QrCodeViewer } from './QrCodeViewer';
import { QrCodeScannerModal } from './QrCodeScannerModal';
import {
  getSavedSyncConfig,
  saveSyncConfig,
  syncJoinHost,
  syncSendCommand,
  syncHostPush,
  syncMobilePoll,
} from '../utils/syncEngine';

interface MobileCompanionViewProps {
  metrics: SystemMetrics;
  notifications: PushNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
  onLockPc: () => void;
  devices: SmartDevice[];
  onToggleDevice: (id: string) => void;
  scpItems: ScpItem[];
  userName: string;
  onExecuteCommandAction?: (action: CommandAction) => void;
}

export const MobileCompanionView: React.FC<MobileCompanionViewProps> = ({
  metrics,
  notifications,
  setNotifications,
  onLockPc,
  devices,
  onToggleDevice,
  scpItems,
  userName,
  onExecuteCommandAction,
}) => {
  const [syncConfig, setSyncConfig] = useState(() => getSavedSyncConfig());
  const [mobileTab, setMobileTab] = useState<'control' | 'telemetry' | 'scp' | 'alerts' | 'sync'>('control');
  const [customPushMessage, setCustomPushMessage] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [remoteStatusMsg, setRemoteStatusMsg] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [voiceRemotePrompt, setVoiceRemotePrompt] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sync loop for Host PC
  useEffect(() => {
    saveSyncConfig(syncConfig);

    const interval = setInterval(async () => {
      if (syncConfig.isHost) {
        const res = await syncHostPush(
          syncConfig.pairingCode,
          syncConfig.hostSecret,
          {
            metrics,
            devices,
            notifications,
            scpItems,
          }
        );

        if (res.success) {
          setClientCount(res.clientCount);
          if (res.pendingCommands && res.pendingCommands.length > 0) {
            res.pendingCommands.forEach((cmd) => {
              SoundFX.playConfirm();
              if (onExecuteCommandAction) {
                onExecuteCommandAction(cmd);
              }
              if (cmd.type === 'LOCK_PC') {
                onLockPc();
              } else if (cmd.type === 'TOGGLE_SMART_DEVICE' && cmd.target) {
                onToggleDevice(cmd.target);
              }
            });
          }
        }
      } else if (syncConfig.connected) {
        // Mobile Client Polling
        const res = await syncMobilePoll(syncConfig.pairingCode);
        if (res.success && res.payload) {
          // Updates received from Host PC
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [syncConfig, metrics, devices, notifications, scpItems]);

  const handleCopyCode = () => {
    SoundFX.playConfirm();
    navigator.clipboard?.writeText(syncConfig.pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePairFromCode = async (code: string) => {
    setIsConnecting(true);
    setRemoteStatusMsg('Verbindung wird weltweit über ARGUS Mesh Relay aufgebaut...');
    SoundFX.playWakeChime();

    const res = await syncJoinHost(code, `Samsung Galaxy von ${userName}`);
    setIsConnecting(false);

    if (res.success) {
      SoundFX.playConfirm();
      setSyncConfig((prev) => ({
        ...prev,
        pairingCode: code,
        connected: true,
        isHost: false,
      }));
      setRemoteStatusMsg(`Erfolgreich gekoppelt mit ${res.hostName || 'ARGUS PC'}!`);
      setTimeout(() => setRemoteStatusMsg(null), 4000);
    } else {
      SoundFX.playAlert();
      setRemoteStatusMsg(`Fehler: ${res.error}`);
    }
  };

  const handleSendRemoteCommand = async (command: CommandAction, label: string) => {
    SoundFX.playConfirm();
    setRemoteStatusMsg(`Befehl wird an PC übertragen: ${label}...`);

    if (syncConfig.isHost) {
      // Local Host shortcut
      if (command.type === 'LOCK_PC') onLockPc();
      else if (command.type === 'TOGGLE_SMART_DEVICE' && command.target) onToggleDevice(command.target);
      else if (onExecuteCommandAction) onExecuteCommandAction(command);
      setRemoteStatusMsg(`Lokal ausgeführt: ${label}`);
      setTimeout(() => setRemoteStatusMsg(null), 2500);
      return;
    }

    const res = await syncSendCommand(syncConfig.pairingCode, command, `Mobile (${userName})`);
    if (res.success) {
      setRemoteStatusMsg(`Erfolg: ${label} wurde am PC ausgeführt!`);
    } else {
      setRemoteStatusMsg(`Fehler bei Übertragung: ${res.error}`);
    }
    setTimeout(() => setRemoteStatusMsg(null), 3000);
  };

  const handleMarkAllRead = () => {
    SoundFX.playToggle();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    SoundFX.playToggle();
    setNotifications([]);
  };

  const handleSendTestPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPushMessage.trim()) return;

    SoundFX.playConfirm();
    const newPush: PushNotification = {
      id: `push-${Date.now()}`,
      title: '📱 ARGUS Mobil-Nachricht',
      message: customPushMessage.trim(),
      type: 'info',
      timestamp: 'Gerade eben',
      read: false,
      urgent: false,
    };

    setNotifications((prev) => [newPush, ...prev]);
    setCustomPushMessage('');
  };

  const handleSendRemoteVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceRemotePrompt.trim()) return;

    handleSendRemoteCommand(
      { type: 'VOICE_QUERY', target: 'AI_BRAIN', value: voiceRemotePrompt },
      `Sprachbefehl: "${voiceRemotePrompt}"`
    );
    setVoiceRemotePrompt('');
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner: Global Cloud Pairing Status */}
      <div className="p-5 rounded-xl bg-[#0d0d0d] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                ARGUS Global Remote & Mobile Sync Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950 text-green-400 border border-green-800 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-ping" />
                Weltweit Live
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Direkte Verbindung zwischen PC-Command-Center und Samsung Mobile App (APK) – über WLAN, LTE & 5G.
            </p>
          </div>
        </div>

        {/* Pairing Pill */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#333] px-3 py-1.5 rounded-lg">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase">Host-Kopplungscode</span>
            <span className="text-xs font-bold text-orange-400 tracking-wider">
              {syncConfig.pairingCode}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="p-1.5 bg-[#222] hover:bg-[#333] text-gray-300 rounded transition-all"
            title="Code kopieren"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-black text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-all"
          >
            <Camera className="w-3 h-3" />
            <span>Koppeln</span>
          </button>
        </div>
      </div>

      {remoteStatusMsg && (
        <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-500/50 text-orange-200 text-xs flex items-center justify-between animate-fade-in">
          <span>{remoteStatusMsg}</span>
          <button onClick={() => setRemoteStatusMsg(null)} className="text-orange-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Smartphone Frame on Left, Cloud Deck on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Authentic Samsung Galaxy / Mobile Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[340px] rounded-[36px] bg-[#080808] border-[6px] border-[#222] shadow-2xl overflow-hidden p-3 relative flex flex-col h-[650px]">
            {/* Phone Speaker & Dynamic Camera Notch */}
            <div className="w-24 h-4 bg-[#141414] rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 border border-[#222]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#333]" />
              <span className="w-8 h-1 rounded-full bg-[#222]" />
            </div>

            {/* Mobile Header */}
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#222] text-[11px] text-gray-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                <span className="font-bold text-orange-400">ARGUS Pocket</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="text-green-400 font-bold">{syncConfig.pairingCode}</span>
                <span>•</span>
                <span>5G</span>
              </div>
            </div>

            {/* Mobile Nav Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-[#0d0d0d] rounded border border-[#222] my-2 text-[9px]">
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setMobileTab('control');
                }}
                className={`py-1 rounded text-center transition-all ${
                  mobileTab === 'control' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'
                }`}
              >
                Control
              </button>
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setMobileTab('telemetry');
                }}
                className={`py-1 rounded text-center transition-all ${
                  mobileTab === 'telemetry' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setMobileTab('scp');
                }}
                className={`py-1 rounded text-center transition-all ${
                  mobileTab === 'scp' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'
                }`}
              >
                SCP
              </button>
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setMobileTab('alerts');
                }}
                className={`py-1 rounded text-center relative transition-all ${
                  mobileTab === 'alerts' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'
                }`}
              >
                Alarme
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 text-[8px] flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setMobileTab('sync');
                }}
                className={`py-1 rounded text-center transition-all ${
                  mobileTab === 'sync' ? 'bg-orange-500 text-black font-bold' : 'text-gray-400'
                }`}
              >
                Koppeln
              </button>
            </div>

            {/* Mobile Screen Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
              {/* TAB 1: REMOTE CONTROL */}
              {mobileTab === 'control' && (
                <div className="space-y-2.5">
                  {/* Master Power & Lock Actions */}
                  <div className="p-2.5 rounded bg-[#111] border border-[#222]">
                    <span className="text-[10px] text-gray-500 uppercase">PC-Echtzeit-Fernsteuerung</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleSendRemoteCommand({ type: 'LOCK_PC' }, 'PC Sperren')}
                        className="p-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-bold flex flex-col items-center gap-1 uppercase tracking-wider shadow-[0_0_12px_#f97316]/30 active:scale-95 transition-all"
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px]">PC Sperren</span>
                      </button>

                      <button
                        onClick={() => handleSendRemoteCommand({ type: 'SLEEP_PC' }, 'PC Ruhezustand')}
                        className="p-2.5 rounded-lg bg-[#181818] text-gray-300 flex flex-col items-center gap-1 hover:bg-[#222] border border-[#222] active:scale-95 transition-all"
                      >
                        <Power className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px]">Ruhezustand</span>
                      </button>
                    </div>
                  </div>

                  {/* Remote Voice Prompt input */}
                  <div className="p-2.5 rounded bg-[#111] border border-[#222]">
                    <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                      <Mic className="w-3 h-3 text-orange-400" />
                      KI-Befehl an PC senden
                    </span>
                    <form onSubmit={handleSendRemoteVoice} className="mt-2 flex gap-1">
                      <input
                        type="text"
                        value={voiceRemotePrompt}
                        onChange={(e) => setVoiceRemotePrompt(e.target.value)}
                        placeholder="z.B. Licht rot schalten..."
                        className="flex-1 bg-[#161616] border border-[#333] rounded px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 rounded bg-orange-500 text-black text-[10px] font-bold"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>

                  {/* Smart Home Quick Toggles */}
                  <div className="p-2.5 rounded bg-[#111] border border-[#222]">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase mb-2">
                      <span>Smart Home Relais</span>
                      <span className="text-orange-400">{devices.filter((d) => d.state).length} AN</span>
                    </div>
                    <div className="space-y-1.5">
                      {devices.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-1.5 rounded bg-[#141414] border border-[#222] text-[11px]"
                        >
                          <span className="text-gray-300 truncate max-w-[130px]">{d.name}</span>
                          <button
                            onClick={() =>
                              handleSendRemoteCommand(
                                { type: 'TOGGLE_SMART_DEVICE', target: d.id },
                                `${d.name} umschalten`
                              )
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              d.state ? 'bg-orange-500 text-black shadow-[0_0_8px_#f97316]/30' : 'bg-[#222] text-gray-400'
                            }`}
                          >
                            {d.state ? 'AN' : 'AUS'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEM TELEMETRY */}
              {mobileTab === 'telemetry' && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-[#111] border border-[#222]">
                    <span className="text-[10px] text-gray-500 uppercase">PC Hardware Auslastung</span>
                    <div className="space-y-2.5 mt-2">
                      <div>
                        <div className="flex justify-between text-[11px]">
                          <span>CPU Last:</span>
                          <span className="text-orange-400 font-bold">{metrics.cpuUsage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#222] rounded mt-1 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${metrics.cpuUsage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px]">
                          <span>RAM Last:</span>
                          <span className="text-orange-400 font-bold">{metrics.ramUsagePercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#222] rounded mt-1 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${metrics.ramUsagePercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px]">
                          <span>GPU Last:</span>
                          <span className="text-orange-400 font-bold">{metrics.gpuUsage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#222] rounded mt-1 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${metrics.gpuUsage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#111] border border-[#222] text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">CPU Temperatur:</span>
                      <span className="text-orange-400 font-bold">{metrics.cpuTemp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lüfterdrehzahl:</span>
                      <span className="text-gray-300">{metrics.fanRpm} RPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">System-Laufzeit:</span>
                      <span className="text-gray-300">{metrics.uptimeHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Netzwerk Download:</span>
                      <span className="text-green-400 font-bold">{metrics.networkDownloadMbps} MB/s</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SCP MOBILE DATABASE */}
              {mobileTab === 'scp' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase">
                    <span>Site-19 Mobile Dossiers</span>
                    <button
                      onClick={() =>
                        handleSendRemoteCommand({ type: 'SCP_LOCKDOWN' }, 'Notfall-Eindämmung auslösen')
                      }
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Lockdown
                    </button>
                  </div>
                  {scpItems.map((scp) => (
                    <div
                      key={scp.id}
                      className="p-2 rounded bg-[#111] border border-[#222] text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-400">{scp.id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#181818] text-gray-400 border border-[#222]">
                          {scp.itemClass}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1 line-clamp-1">{scp.name}</p>
                      <span className="text-[9px] text-green-400 block mt-0.5">
                        Status: {scp.containmentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: PUSH ALERTS */}
              {mobileTab === 'alerts' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>PUSH-BENACHRICHTIGUNGEN</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-orange-400 hover:underline"
                    >
                      Alle gelesen
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-[11px]">
                      Keine Benachrichtigungen vorhanden.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded border text-[11px] ${
                          notif.urgent
                            ? 'bg-red-950/60 border-red-800 text-red-200'
                            : notif.read
                            ? 'bg-[#111] border-[#222] text-gray-500'
                            : 'bg-[#141414] border-orange-500/30 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span className="text-orange-400">{notif.title}</span>
                          <span className="text-[9px] font-normal text-gray-500">{notif.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: SYNC & PAIRING CONFIG */}
              {mobileTab === 'sync' && (
                <div className="space-y-3">
                  <div className="p-3 rounded bg-[#111] border border-[#222] text-center space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase block">Kopplungs-Status</span>
                    <div className="text-sm font-bold text-orange-400">{syncConfig.pairingCode}</div>
                    <span className="text-[10px] text-green-400 block">
                      {syncConfig.isHost ? '💻 PC Host aktiv' : '📱 Als Mobile-Client verbunden'}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-orange-500 text-black font-bold text-xs uppercase flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Anderen PC koppeln</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Home Bar */}
            <div className="w-28 h-1 bg-[#333] rounded-full mx-auto mt-2" />
          </div>
        </div>

        {/* Right 7 Cols: PC QR-Code Generator & Cloud Hub */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR Code & Pairing Deck for PC Monitor */}
          <div className="p-6 rounded-xl bg-[#0d0d0d] border border-[#222]">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Kopplungscode & QR-Code für Ihr Smartphone
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Öffnen Sie ARGUS auf Ihrem Smartphone und scannen Sie diesen QR-Code oder geben Sie den Code ein.
                </p>
              </div>

              <div className="px-3 py-1 rounded bg-[#141414] border border-[#333] text-[11px] text-gray-400">
                Verbundene Geräte: <strong className="text-orange-400">{clientCount}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Crisp SVG QR Code */}
              <div className="sm:col-span-5 flex justify-center">
                <QrCodeViewer
                  value={`ARGUS-PAIR:${syncConfig.pairingCode}`}
                  size={190}
                  label={syncConfig.pairingCode}
                />
              </div>

              {/* Pairing Instructions & Actions */}
              <div className="sm:col-span-7 space-y-3 text-xs">
                <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222] space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase block">1. 6-Stelliger Master-Code</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-orange-400 tracking-[0.2em]">
                      {syncConfig.pairingCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 rounded bg-[#222] hover:bg-[#333] text-gray-200 text-xs flex items-center gap-1 transition-all"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Kopiert!' : 'Kopieren'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222] space-y-1 text-gray-400 text-[11px] leading-relaxed">
                  <div className="text-gray-300 font-bold mb-1">So verbinden Sie Ihr Handy:</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>ARGUS APK auf dem Samsung-Handy öffnen.</li>
                    <li>Auf <strong>"Koppeln"</strong> tippen.</li>
                    <li>Kamera auf den QR-Code links richten oder Code <strong>{syncConfig.pairingCode}</strong> eintippen.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Push Dispatcher */}
          <div className="p-5 rounded-xl bg-[#0d0d0d] border border-[#222]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4" />
              Direkte Push-Benachrichtigung an Smartphone senden
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Testen Sie die mobile Alarmübertragung für Sicherheitsvorfälle, Erinnerungen oder Server-Events.
            </p>

            <form onSubmit={handleSendTestPush} className="flex items-center gap-2">
              <input
                type="text"
                required
                value={customPushMessage}
                onChange={(e) => setCustomPushMessage(e.target.value)}
                placeholder="Push-Nachrichtentext eingeben (z.B. Backup abgeschlossen)..."
                className="flex-1 bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold transition-all uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Senden</span>
              </button>
            </form>
          </div>

          {/* Notification Center Log */}
          <div className="p-5 rounded-xl bg-[#0d0d0d] border border-[#222]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Empfangene Benachrichtigungen ({notifications.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-gray-500 hover:text-orange-400"
                >
                  Alle als gelesen markieren
                </button>
                <button
                  onClick={handleClearNotifications}
                  className="p-1 text-gray-500 hover:text-red-400"
                  title="Verlauf leeren"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto text-xs">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                    n.urgent
                      ? 'bg-red-950/60 border-red-800'
                      : n.read
                      ? 'bg-[#111] border-[#222] opacity-60'
                      : 'bg-[#141414] border-[#222]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          n.urgent ? 'text-red-400' : 'text-orange-400'
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[10px] text-gray-500">{n.timestamp}</span>
                    </div>
                    <p className="text-gray-300 mt-1 text-xs">{n.message}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      n.type === 'security'
                        ? 'bg-red-950/80 text-red-400 border border-red-900/60'
                        : n.type === 'scp'
                        ? 'bg-purple-950/80 text-purple-400 border border-purple-900/60'
                        : 'bg-[#181818] text-gray-500 border border-[#222]'
                    }`}
                  >
                    {n.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner & Code Input Modal */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCodeDetected={(code) => handlePairFromCode(code)}
      />
    </div>
  );
};
