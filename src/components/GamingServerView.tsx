import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  MessageSquare,
  Box,
  Play,
  Square,
  RotateCw,
  Send,
  Users,
  Shield,
  Terminal,
  Activity,
  CheckCircle,
  Database,
  Radio,
  UserX,
  Volume2,
} from 'lucide-react';
import { DiscordState, MinecraftState } from '../types';
import { SoundFX } from '../utils/audio';

interface GamingServerViewProps {
  discord: DiscordState;
  setDiscord: React.Dispatch<React.SetStateAction<DiscordState>>;
  minecraft: MinecraftState;
  setMinecraft: React.Dispatch<React.SetStateAction<MinecraftState>>;
}

export const GamingServerView: React.FC<GamingServerViewProps> = ({
  discord,
  setDiscord,
  minecraft,
  setMinecraft,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'minecraft' | 'discord'>('minecraft');
  const [rconCommand, setRconCommand] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementChannel, setAnnouncementChannel] = useState('📢-system-status');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [minecraft.consoleLogs]);

  // Handle Minecraft Server actions
  const handleServerAction = (action: 'start' | 'stop' | 'restart' | 'backup') => {
    SoundFX.playConfirm();
    if (action === 'start') {
      setMinecraft((prev) => ({
        ...prev,
        status: 'online',
        consoleLogs: [
          ...prev.consoleLogs,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: [ARGUS] Bootstrapping Paper 1.21 server jar...`,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: Done (4.21s)! For help, type "help"`,
        ],
      }));
    } else if (action === 'stop') {
      setMinecraft((prev) => ({
        ...prev,
        status: 'offline',
        onlinePlayers: [],
        consoleLogs: [
          ...prev.consoleLogs,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: [ARGUS] Server shutdown initiated. Saving worlds...`,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: ThreadedAnvilChunkStorage: All dimensions saved. Closing server.`,
        ],
      }));
    } else if (action === 'restart') {
      setMinecraft((prev) => ({
        ...prev,
        status: 'restarting',
        consoleLogs: [
          ...prev.consoleLogs,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: [ARGUS] Performing soft server reboot...`,
        ],
      }));
      setTimeout(() => {
        setMinecraft((prev) => ({
          ...prev,
          status: 'online',
          consoleLogs: [
            ...prev.consoleLogs,
            `[${new Date().toLocaleTimeString('de-DE')} INFO]: [ARGUS] Server reboot completed. 20.0 TPS restored.`,
          ],
        }));
      }, 1500);
    } else if (action === 'backup') {
      const backupFile = `world_backup_${new Date().toISOString().slice(0, 10)}.tar.gz`;
      setMinecraft((prev) => ({
        ...prev,
        consoleLogs: [
          ...prev.consoleLogs,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: [ARGUS] Creating immutable world snapshot: ${backupFile}`,
          `[${new Date().toLocaleTimeString('de-DE')} INFO]: [ARGUS] Backup verified and stored in cloud repository.`,
        ],
      }));
      alert(`ARGUS: Welt-Backup erfolgreich erstellt (${backupFile})`);
    }
  };

  const handleSendRcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rconCommand.trim()) return;

    SoundFX.playConfirm();
    const cmd = rconCommand.trim();
    setRconCommand('');

    let reply = `[Server] Unknown command.`;
    if (cmd.startsWith('/time')) {
      reply = `[Server] Set the time to 1000 (Day)`;
    } else if (cmd.startsWith('/weather')) {
      reply = `[Server] Set weather to clear`;
    } else if (cmd.startsWith('/op')) {
      const user = cmd.split(' ')[1] || 'Player';
      reply = `[Server] Made ${user} a server operator`;
    } else if (cmd.startsWith('/say')) {
      reply = `[Server] [ARGUS Broadcast]: ${cmd.replace('/say', '').trim()}`;
    } else if (cmd.startsWith('/kick')) {
      const user = cmd.split(' ')[1] || 'Player';
      reply = `[Server] Kicked player ${user}`;
      setMinecraft((prev) => ({
        ...prev,
        onlinePlayers: prev.onlinePlayers.filter((p) => p !== user),
      }));
    } else {
      reply = `[Server] Executed RCON: ${cmd}`;
    }

    setMinecraft((prev) => ({
      ...prev,
      consoleLogs: [
        ...prev.consoleLogs,
        `[${new Date().toLocaleTimeString('de-DE')} RCON]: ${cmd}`,
        `[${new Date().toLocaleTimeString('de-DE')} INFO]: ${reply}`,
      ],
    }));
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    SoundFX.playConfirm();
    const newAnn = {
      id: `ann-${Date.now()}`,
      text: announcementText.trim(),
      channel: announcementChannel,
      timestamp: 'Gerade eben',
      author: 'ARGUS [BOT]',
    };

    setDiscord((prev) => ({
      ...prev,
      recentAnnouncements: [newAnn, ...prev.recentAnnouncements],
    }));

    setAnnouncementText('');
    alert(`Discord-Ankündigung erfolgreich in #${announcementChannel} gesendet!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4" />
            Discord- & Minecraft-Verwaltung
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Echtzeit-Serverüberwachung, RCON-Konsole, Bot-Steuerung und Community-Management.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded border border-[#222]">
          <button
            onClick={() => {
              SoundFX.playToggle();
              setActiveSubTab('minecraft');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all uppercase tracking-wider ${
              activeSubTab === 'minecraft'
                ? 'bg-orange-500 text-black'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Minecraft Server</span>
          </button>

          <button
            onClick={() => {
              SoundFX.playToggle();
              setActiveSubTab('discord');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all uppercase tracking-wider ${
              activeSubTab === 'discord'
                ? 'bg-orange-500 text-black'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discord Gateway</span>
          </button>
        </div>
      </div>

      {/* MINECRAFT SUBTAB */}
      {activeSubTab === 'minecraft' && (
        <div className="space-y-6">
          {/* Server Status Ribbon & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">SERVER STATUS</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    minecraft.status === 'online'
                      ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-mono font-bold text-gray-100 uppercase">
                  {minecraft.status}
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                {minecraft.version}
              </span>
            </div>

            <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">TPS TICKRATE</span>
              <div className="text-xl font-mono font-bold text-green-400 mt-1">
                {minecraft.tps.toFixed(1)} / 20.0
              </div>
              <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                Maximale Stabilität
              </span>
            </div>

            <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">SPIELER ONLINE</span>
              <div className="text-xl font-mono font-bold text-orange-400 mt-1">
                {minecraft.onlinePlayers.length} / {minecraft.maxPlayers}
              </div>
              <span className="text-[10px] font-mono text-gray-500 mt-1 block truncate">
                {minecraft.onlinePlayers.join(', ') || 'Keine Spieler'}
              </span>
            </div>

            <div className="p-5 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">RAM-ALLOCATION</span>
              <div className="text-xl font-mono font-bold text-gray-200 mt-1">
                {minecraft.ramUsedGb} / {minecraft.ramAllocatedGb} GB
              </div>
              <div className="w-full h-1 bg-[#222] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${(minecraft.ramUsedGb / minecraft.ramAllocatedGb) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls & Player List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live RCON Console */}
            <div className="lg:col-span-2 p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-col h-[420px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                    Live Server-Konsole & RCON Stream
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {minecraft.status === 'online' ? (
                    <>
                      <button
                        onClick={() => handleServerAction('restart')}
                        className="px-2.5 py-1 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-gray-300 text-xs font-mono transition-colors"
                        title="Server Neustart"
                      >
                        Neustart
                      </button>
                      <button
                        onClick={() => handleServerAction('stop')}
                        className="px-2.5 py-1 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 text-red-400 text-xs font-mono transition-colors"
                      >
                        Stoppen
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleServerAction('start')}
                      className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-colors"
                    >
                      Server Starten
                    </button>
                  )}
                  <button
                    onClick={() => handleServerAction('backup')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#141414] border border-[#222] hover:border-orange-500 text-orange-400 text-xs font-mono transition-all"
                  >
                    <Database className="w-3 h-3" />
                    <span>Backup</span>
                  </button>
                </div>
              </div>

              {/* Console Output Log */}
              <div className="flex-1 bg-black p-3.5 rounded border border-[#222] font-mono text-[11px] overflow-y-auto text-gray-300 space-y-1">
                {minecraft.consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('ERROR')
                        ? 'text-red-400'
                        : log.includes('WARN')
                        ? 'text-yellow-400'
                        : log.includes('RCON')
                        ? 'text-orange-400 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>

              {/* RCON Command Input */}
              <form onSubmit={handleSendRcon} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={rconCommand}
                  onChange={(e) => setRconCommand(e.target.value)}
                  placeholder="RCON Befehl eingeben (z.B. /time set day, /op Matthias, /say Hallo)..."
                  className="flex-1 bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Right Col: Active Players & Moderation */}
            <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" />
                  Verbundene Spieler ({minecraft.onlinePlayers.length})
                </h3>

                <div className="space-y-2">
                  {minecraft.onlinePlayers.length === 0 ? (
                    <p className="text-xs font-mono text-gray-500 italic">
                      Aktuell keine Spieler online.
                    </p>
                  ) : (
                    minecraft.onlinePlayers.map((player) => (
                      <div
                        key={player}
                        className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#222] text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-400">
                            {player[0]}
                          </div>
                          <span className="text-gray-200 font-semibold">{player}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              SoundFX.playConfirm();
                              setMinecraft((prev) => ({
                                ...prev,
                                onlinePlayers: prev.onlinePlayers.filter((p) => p !== player),
                                consoleLogs: [
                                  ...prev.consoleLogs,
                                  `[${new Date().toLocaleTimeString('de-DE')} INFO]: [Server] Kicked ${player} from server.`,
                                ],
                              }));
                            }}
                            className="p-1 rounded bg-[#181818] border border-[#222] hover:border-red-500 text-gray-400 hover:text-red-400 transition-colors"
                            title="Kick Player"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Server Info Card */}
              <div className="mt-4 p-3 rounded bg-[#141414] border border-[#222] text-[10px] font-mono text-gray-500 space-y-1">
                <div className="text-orange-400 font-bold">MOTD:</div>
                <div className="text-gray-300 italic">{minecraft.motd}</div>
                <div className="pt-1 text-gray-500">Schwierigkeitsgrad: {minecraft.difficulty}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCORD SUBTAB */}
      {activeSubTab === 'discord' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discord Bot Status Card */}
          <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] space-y-4">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">GATEWAY BOT STATUS</span>
              <div className="flex items-center justify-between mt-1">
                <h3 className="text-sm font-mono font-bold text-gray-100">{discord.botName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-950/80 border border-green-500/30 text-green-400 uppercase">
                  {discord.botStatus}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#141414] border border-[#222] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Server/Guild:</span>
                <span className="text-orange-400 font-semibold">{discord.guildName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mitglieder Online:</span>
                <span className="text-gray-200 font-semibold">{discord.onlineMembers} Nutzer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Gateway Latenz:</span>
                <span className="text-green-400 font-semibold">{discord.latencyMs} ms</span>
              </div>
            </div>

            {/* Voice Channel Monitor */}
            <div className="p-3 rounded bg-[#141414] border border-[#222]">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  Aktiver Sprachkanal:
                </span>
                <span className="text-orange-400 font-bold">{discord.activeVoiceChannel}</span>
              </div>
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setDiscord((prev) => ({ ...prev, voiceConnected: !prev.voiceConnected }));
                }}
                className={`w-full py-1.5 rounded text-xs font-mono font-bold transition-all uppercase tracking-wider ${
                  discord.voiceConnected
                    ? 'bg-orange-500 text-black'
                    : 'bg-[#181818] border border-[#222] text-gray-400 hover:text-white'
                }`}
              >
                {discord.voiceConnected ? 'Sprach-Bridge Trennen' : 'Sprach-Bridge Verbinden'}
              </button>
            </div>
          </div>

          {/* Announcement Dispatcher & Feed */}
          <div className="lg:col-span-2 p-5 rounded-lg bg-[#0d0d0d] border border-[#222] space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Discord Broadcast Ankündigung Senden
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Senden Sie Sofortnachrichten über den ARGUS Bot in Ihre Discord-Kanäle.
              </p>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1/3">
                  <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                    Zielkanal
                  </label>
                  <select
                    value={announcementChannel}
                    onChange={(e) => setAnnouncementChannel(e.target.value)}
                    className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                  >
                    <option value="📢-system-status">#📢-system-status</option>
                    <option value="⛏-minecraft-news">#⛏-minecraft-news</option>
                    <option value="💬-allgemein">#💬-allgemein</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                    Nachrichtentext
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="z.B. Wartungsarbeiten um 20 Uhr abgeschlossen..."
                    className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ankündigung Senden</span>
                </button>
              </div>
            </form>

            {/* Recent Announcements Stream */}
            <div className="pt-3 border-t border-[#222]">
              <h4 className="text-xs font-mono font-bold text-gray-400 mb-3 uppercase tracking-wider">
                Veröffentlichte Ankündigungen
              </h4>

              <div className="space-y-2">
                {discord.recentAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded bg-[#141414] border border-[#222] text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-gray-500 mb-1 text-[10px]">
                      <span className="text-orange-400 font-bold">{ann.author} in {ann.channel}</span>
                      <span>{ann.timestamp}</span>
                    </div>
                    <p className="text-gray-300">{ann.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
