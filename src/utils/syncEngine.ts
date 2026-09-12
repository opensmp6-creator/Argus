/**
 * ARGUS Worldwide Real-Time Cloud Sync & Pairing Engine
 * Enables real-time synchronization between the PC Command Center and Mobile APK across LAN/WAN/Mobile Internet.
 */

import { CommandAction, RemoteSyncPayload } from '../types';

export interface SyncConfig {
  pairingCode: string;
  hostSecret?: string;
  isHost: boolean;
  relayUrl: string;
  connected: boolean;
  clientName?: string;
  lastSync?: number;
}

const STORAGE_KEY = 'argus_sync_config';

export function getSavedSyncConfig(): SyncConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}

  // Default: generate a random clean 4-digit ID for new host
  const defaultCode = `ARG-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    pairingCode: defaultCode,
    isHost: true,
    relayUrl: window.location.origin,
    connected: false,
    clientName: 'ARGUS Companion Device',
  };
}

export function saveSyncConfig(config: SyncConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

/**
 * Host Heartbeat & Push: Sends current PC state and retrieves queued remote commands from mobile
 */
export async function syncHostPush(
  pairingCode: string,
  hostSecret: string | undefined,
  payload: RemoteSyncPayload,
  relayUrl?: string
): Promise<{ success: boolean; pendingCommands: CommandAction[]; clientCount: number; error?: string }> {
  try {
    const baseUrl = (relayUrl || window.location.origin).replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/argus/sync/host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode,
        hostSecret,
        hostName: 'ARGUS Main PC Terminal',
        payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      pendingCommands: data.pendingCommands || [],
      clientCount: data.clientCount || 0,
    };
  } catch (err: any) {
    return { success: false, pendingCommands: [], clientCount: 0, error: err.message };
  }
}

/**
 * Mobile Join: Connects a mobile device to a PC using the 6-character Pairing Code
 */
export async function syncJoinHost(
  pairingCode: string,
  clientName: string = 'Samsung Galaxy Companion',
  relayUrl?: string
): Promise<{ success: boolean; hostName?: string; payload?: RemoteSyncPayload; error?: string }> {
  try {
    const baseUrl = (relayUrl || window.location.origin).replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/argus/sync/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: pairingCode.toUpperCase().trim(),
        clientName,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Verbindung fehlgeschlagen' };
    }

    return {
      success: true,
      hostName: data.hostName,
      payload: data.payload,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Verbindungsfehler' };
  }
}

/**
 * Mobile Poll: Fetches the latest PC telemetry & status
 */
export async function syncMobilePoll(
  pairingCode: string,
  relayUrl?: string
): Promise<{ success: boolean; hostOnline?: boolean; payload?: RemoteSyncPayload; error?: string }> {
  try {
    const baseUrl = (relayUrl || window.location.origin).replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/argus/sync/poll/${encodeURIComponent(pairingCode.toUpperCase().trim())}`);

    if (!res.ok) {
      throw new Error(`Host status code ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      hostOnline: data.hostOnline,
      payload: data.payload,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Mobile Command: Sends a remote command to the host PC (e.g. LOCK_PC, TOGGLE_DEVICE, VOICE_QUERY)
 */
export async function syncSendCommand(
  pairingCode: string,
  command: CommandAction,
  sender: string = 'Mobile App',
  relayUrl?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const baseUrl = (relayUrl || window.location.origin).replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/argus/sync/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: pairingCode.toUpperCase().trim(),
        command,
        sender,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Befehl konnte nicht gesendet werden' };
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
