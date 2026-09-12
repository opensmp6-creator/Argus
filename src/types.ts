export type AddressType = 'master' | 'matthias' | 'custom';
export type SalutationMode = 'sie' | 'du';
export type RoleType = 'Owner' | 'Senior Admin' | 'Operator' | 'Guest';

export interface CommandAction {
  type: string;
  target?: string;
  value?: any;
}

export interface ArgusSettings {
  userName: 'Master' | 'Matthias' | string;
  addressForm: 'Sie' | 'Du';
  wakeWordEnabled: boolean;
  wakeWord: string;
  voiceEnabled: boolean;
  soundEffectsEnabled: boolean;
  voicePitch: number; // 0.5 - 1.5, default 0.85 for deep male voice
  voiceRate: number; // 0.8 - 1.3, default 1.0
  selectedVoiceName?: string;
  autoLockOnIntruder: boolean;
  autoLockDelaySeconds: number;
  recordSessionWithConsent: boolean;
  privacyConsentWebcam: boolean;
  privacyConsentAudio: boolean;
  privacyConsentTelemetry: boolean;
  emergencyLockCode: string;
}

export interface SystemMetrics {
  cpuUsage: number; // percentage
  gpuUsage: number;
  ramUsagePercent: number;
  ramTotalGb: number;
  ramUsedGb: number;
  vramUsage: number;
  vramTotalGb: number;
  diskUsage: number;
  diskFreeGb: number;
  networkDownloadMbps: number;
  networkUploadMbps: number;
  cpuTemp: number; // °C
  gpuTemp: number; // °C
  fanRpm: number;
  uptimeHours: number;
  ipAddress: string;
  activeProcesses: number;
}

export interface AppItem {
  id: string;
  name: string;
  icon: string;
  category: 'development' | 'gaming' | 'system' | 'communication' | 'media';
  status: 'running' | 'stopped' | 'suspended';
  cpuUsage: number;
  ramUsageMb: number;
  path: string;
  autoRestart?: boolean;
}

export interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'socket' | 'shutter';
  room: string;
  state: boolean;
  value?: number; // e.g. brightness %, temperature °C
  colorHex?: string;
  statusText?: string;
}

export interface DiscordState {
  botName: string;
  botStatus: 'online' | 'idle' | 'dnd' | 'offline';
  latencyMs: number;
  guildName: string;
  onlineMembers: number;
  activeVoiceChannel: string;
  voiceConnected: boolean;
  recentAnnouncements: {
    id: string;
    text: string;
    channel: string;
    timestamp: string;
    author: string;
  }[];
}

export interface MinecraftState {
  serverName: string;
  version: string;
  status: 'online' | 'offline' | 'restarting';
  tps: number;
  onlinePlayers: string[];
  maxPlayers: number;
  ramAllocatedGb: number;
  ramUsedGb: number;
  difficulty: string;
  motd: string;
  consoleLogs: string[];
}

export interface ReminderItem {
  id: string;
  title: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  completed: boolean;
  isAlarm: boolean;
  category: string;
}

export interface BiometricProfile {
  isRegistered: boolean;
  registeredName: string;
  registeredPhoto?: string; // base64 / dataUrl
  lastScanStatus: 'idle' | 'scanning' | 'authorized' | 'intruder' | 'no_face';
  matchScore: number; // 0 - 100
  registeredDate?: string;
  intruderSnapshots: {
    id: string;
    timestamp: string;
    imageUrl?: string;
    confidence: number;
    resolved: boolean;
  }[];
}

export type ScpClass = 'Safe' | 'Euclid' | 'Keter' | 'Thaumiel' | 'Apollyon';
export type ContainmentState = 'Contained' | 'Breached' | 'Protocol Active' | 'Quarantined';

export interface ScpItem {
  id: string; // e.g. 'SCP-001'
  name: string;
  itemClass: ScpClass;
  containmentStatus: ContainmentState;
  sector: string;
  threatLevel: 'White' | 'Blue' | 'Green' | 'Orange' | 'Red' | 'Black';
  description: string;
  specialContainmentProcedures: string;
  incidentHistory: string;
  lockdownCode: string;
}

export interface AdminInviteCode {
  id: string;
  code: string;
  createdBy: string;
  targetRole: RoleType;
  durationMinutes: number;
  expiresAt: string;
  permissions: string[];
  used: boolean;
  createdAt: string;
}

export interface RemoteMaintenanceSession {
  id: string;
  requesterName: string;
  requesterRole: RoleType;
  reason: string;
  ipAddress: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'terminated';
  recordingEnabled: boolean;
  userConsented: boolean;
  startedAt?: string;
  endedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: RoleType | 'System';
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'security' | 'critical';
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'system' | 'smart_home' | 'scp' | 'reminder' | 'info';
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

export interface VoiceDialogueTurn {
  id: string;
  sender: 'user' | 'argus';
  text: string;
  timestamp: string;
  actionsExecuted?: string[];
}

export interface SyncSessionState {
  pairingCode: string;
  relayUrl: string;
  isHost: boolean;
  isConnected: boolean;
  remoteDeviceName?: string;
  lastPing?: number;
  connectionMode: 'cloud_relay' | 'lan_direct' | 'webrtc';
}

export interface RemoteSyncPayload {
  metrics?: SystemMetrics;
  devices?: SmartDevice[];
  notifications?: PushNotification[];
  scpItems?: ScpItem[];
  apps?: AppItem[];
  isPcLocked?: boolean;
}

export interface RemoteCommandMessage {
  id: string;
  type: string;
  target?: string;
  value?: any;
  timestamp: number;
  sender: string;
}

