import React from 'react';
import {
  Cpu,
  Activity,
  Wifi,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Lock,
  RefreshCw,
  Layers,
  Home,
  CheckCircle,
} from 'lucide-react';
import {
  SystemMetrics,
  AppItem,
  SmartDevice,
  ScpItem,
  ReminderItem,
  PushNotification,
} from '../types';
import { SoundFX } from '../utils/audio';

interface DashboardViewProps {
  metrics: SystemMetrics;
  apps: AppItem[];
  smartDevices: SmartDevice[];
  scpItems: ScpItem[];
  reminders: ReminderItem[];
  notifications: PushNotification[];
  onLockPc: () => void;
  onNavigateTab: (tab: string) => void;
  onToggleDevice: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  apps,
  smartDevices,
  scpItems,
  reminders,
  notifications: _notifications,
  onLockPc,
  onNavigateTab,
  onToggleDevice,
}) => {
  const activeAppsCount = apps.filter((a) => a.status === 'running').length;
  const activeLightsCount = smartDevices.filter(
    (d) => d.type === 'light' && d.state
  ).length;
  const breachedScps = scpItems.filter(
    (s) => s.containmentStatus === 'Breached'
  );
  const pendingReminders = reminders.filter((r) => !r.completed);

  return (
    <div className="space-y-6">
      {/* Top Banner / System Health Bar */}
      <div className="relative p-6 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-mono font-bold text-gray-200 tracking-wider uppercase">
                Systemstatus: Nominal & Einsatzbereit
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-950/60 border border-green-500/30 text-green-400">
                100% OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              ARGUS überwacht {metrics.activeProcesses} aktive Prozesse • {metrics.ipAddress} • UPTIME: {metrics.uptimeHours}H
            </p>
          </div>
        </div>

        {/* Quick Power / Lock Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              SoundFX.playLock();
              onLockPc();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all shadow-[0_0_12px_#f97316]/40 uppercase tracking-wider"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>PC Sperren</span>
          </button>

          <button
            onClick={() => {
              SoundFX.playConfirm();
              alert('ARGUS: Schneller System-Reboot-Zyklus initiiert (Simuliert).');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#141414] border border-[#222] hover:border-orange-500/40 text-gray-400 hover:text-orange-400 text-xs font-mono transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span>Reboot</span>
          </button>
        </div>
      </div>

      {/* Main Hardware Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Telemetry Card */}
        <div className="p-5 rounded-lg bg-[#111] border border-[#222] hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-orange-500" />
              Prozessor (CPU)
            </span>
            <span className="text-xs font-mono text-orange-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              {metrics.cpuTemp}°C
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-mono font-bold text-gray-100">
              {metrics.cpuUsage}%
            </span>
            <span className="text-[10px] font-mono text-gray-500">16 Cores @ 4.8 GHz</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.cpuUsage > 80 ? 'bg-red-500' : 'bg-orange-500'
              }`}
              style={{ width: `${metrics.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* RAM Telemetry Card */}
        <div className="p-5 rounded-lg bg-[#111] border border-[#222] hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-orange-500" />
              Arbeitsspeicher
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              {metrics.ramUsedGb.toFixed(1)} / {metrics.ramTotalGb} GB
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-mono font-bold text-gray-100">
              {metrics.ramUsagePercent}%
            </span>
            <span className="text-[10px] font-mono text-gray-500">DDR5 Quad-Channel</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${metrics.ramUsagePercent}%` }}
            />
          </div>
        </div>

        {/* GPU Telemetry Card */}
        <div className="p-5 rounded-lg bg-[#111] border border-[#222] hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-orange-500" />
              Grafik (GPU)
            </span>
            <span className="text-xs font-mono text-orange-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              {metrics.gpuTemp}°C
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-mono font-bold text-gray-100">
              {metrics.gpuUsage}%
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              VRAM: {metrics.vramUsage}% ({metrics.vramTotalGb}GB)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${metrics.gpuUsage}%` }}
            />
          </div>
        </div>

        {/* Storage / Network Card */}
        <div className="p-5 rounded-lg bg-[#111] border border-[#222] hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Wifi className="w-4 h-4 text-orange-500" />
              Netzwerk & NVMe
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              {metrics.fanRpm} RPM
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs font-mono text-orange-400">
              ↓ {metrics.networkDownloadMbps} MB/s • ↑ {metrics.networkUploadMbps} MB/s
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mb-1">
            <span>NVMe SSD Speicher:</span>
            <span>{metrics.diskUsage}% ({metrics.diskFreeGb} GB frei)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full bg-orange-500"
              style={{ width: `${metrics.diskUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Section Grid: Modules & Security Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Hub Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Programs & Servers Quick Status */}
          <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Aktive Software & Prozesssteuerung ({activeAppsCount} laufend)
              </h3>
              <button
                onClick={() => onNavigateTab('apps')}
                className="text-xs font-mono text-gray-500 hover:text-orange-400 transition-colors"
              >
                Alle Programme »
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apps.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        app.status === 'running'
                          ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                          : 'bg-gray-700'
                      }`}
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-gray-200">{app.name}</h4>
                      <p className="text-[10px] font-mono text-gray-500">
                        {app.status === 'running'
                          ? `${app.cpuUsage}% CPU • ${app.ramUsageMb} MB`
                          : 'Gestoppt'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      app.status === 'running'
                        ? 'bg-green-950/80 text-green-400 border border-green-500/30'
                        : 'bg-[#181818] text-gray-500'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Home Matrix Quick Toggles */}
          <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Smart Home Schnellsteuerung ({activeLightsCount} Lichter an)
              </h3>
              <button
                onClick={() => onNavigateTab('smarthome')}
                className="text-xs font-mono text-gray-500 hover:text-orange-400 transition-colors"
              >
                Smart Home Matrix »
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {smartDevices.slice(0, 3).map((device) => (
                <div
                  key={device.id}
                  className="p-3.5 rounded bg-[#141414] border border-[#222] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-gray-500">{device.room}</span>
                    <h4 className="text-xs font-semibold text-gray-200 mt-0.5 truncate">
                      {device.name}
                    </h4>
                    <p className="text-[10px] font-mono text-orange-400/90 mt-1">
                      {device.statusText}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#222] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500">
                      {device.state ? 'Aktiv' : 'Aus'}
                    </span>
                    <button
                      onClick={() => onToggleDevice(device.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                        device.state
                          ? 'bg-orange-500 text-black font-semibold'
                          : 'bg-[#181818] text-gray-400 hover:text-white'
                      }`}
                    >
                      {device.state ? 'Ausschalten' : 'Einschalten'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Security, SCP Status & Pending Tasks */}
        <div className="space-y-6">
          {/* SCP Containment Threat Monitor Snapshot */}
          <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                SCP Containment Monitoring
              </h3>
              <button
                onClick={() => onNavigateTab('scp')}
                className="text-xs font-mono text-gray-500 hover:text-orange-400 transition-colors"
              >
                SCP DB »
              </button>
            </div>

            {breachedScps.length > 0 ? (
              <div className="p-3 rounded bg-red-950/20 border border-red-900/50 border-dashed text-red-400 text-xs font-mono mb-3">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                  BREACH_ALERT
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {breachedScps.length} Subjekt(e) haben Sicherheitslinie durchbrochen!
                </p>
              </div>
            ) : (
              <div className="p-3 rounded bg-orange-950/10 border border-orange-900/50 text-xs font-mono text-orange-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Site-19: Alle Einheiten STABLE</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {scpItems.slice(0, 4).map((scp) => (
                <div
                  key={scp.id}
                  className={`p-2.5 rounded border text-xs font-mono ${
                    scp.containmentStatus === 'Contained'
                      ? 'border-orange-900/50 bg-orange-950/10 text-orange-400'
                      : 'border-red-900/50 bg-red-950/20 text-red-400 border-dashed'
                  }`}
                >
                  <span className="text-[10px] text-gray-600 block mb-0.5">{scp.id}</span>
                  <span className="text-xs font-mono font-semibold block truncate">
                    {scp.containmentStatus === 'Contained' ? 'STABLE' : 'BREACH_ALERT'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reminders & Alarms */}
          <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Erinnerungen ({pendingReminders.length})
              </h3>
              <button
                onClick={() => onNavigateTab('reminders')}
                className="text-xs font-mono text-gray-500 hover:text-orange-400 transition-colors"
              >
                Verwalten »
              </button>
            </div>

            <div className="space-y-2">
              {pendingReminders.slice(0, 3).map((rem) => (
                <div
                  key={rem.id}
                  className="p-3 rounded bg-[#141414] border border-[#222] flex items-start justify-between gap-2"
                >
                  <div>
                    <h4 className="text-xs text-gray-200 font-medium">{rem.title}</h4>
                    <span className="text-[10px] font-mono text-orange-400/80">
                      Fällig: {rem.dueTime}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                      rem.priority === 'critical'
                        ? 'bg-red-950/60 border border-red-500/40 text-red-400'
                        : rem.priority === 'high'
                        ? 'bg-orange-950/60 border border-orange-500/40 text-orange-400'
                        : 'bg-[#181818] text-gray-500'
                    }`}
                  >
                    {rem.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
