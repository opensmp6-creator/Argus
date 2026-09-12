import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
  Plus,
  Play,
  Square,
  Lock,
  Trash2,
  Video,
} from 'lucide-react';
import {
  RoleType,
  AdminInviteCode,
  RemoteMaintenanceSession,
  AuditLogEntry,
} from '../types';
import { SoundFX } from '../utils/audio';

interface AdminOwnerViewProps {
  inviteCodes: AdminInviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<AdminInviteCode[]>>;
  remoteSession: RemoteMaintenanceSession | null;
  setRemoteSession: React.Dispatch<React.SetStateAction<RemoteMaintenanceSession | null>>;
  auditLogs: AuditLogEntry[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  userName: string;
}

export const AdminOwnerView: React.FC<AdminOwnerViewProps> = ({
  inviteCodes,
  setInviteCodes,
  remoteSession,
  setRemoteSession,
  auditLogs,
  setAuditLogs,
  userName,
}) => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('Senior Admin');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'Fernwartung',
    'App-Steuerung',
    'Minecraft-RCON',
  ]);
  const [recordConsent, setRecordConsent] = useState(false);

  const availablePermissions = [
    'Fernwartung',
    'App-Steuerung',
    'Smart-Home',
    'Minecraft-RCON',
    'SCP-Protokolle',
    'System-Reboot',
  ];

  const handleTogglePermission = (perm: string) => {
    SoundFX.playToggle();
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  // Generate Temporary Admin Invite Code
  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    SoundFX.playConfirm();

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const durationLabel = durationMinutes >= 60 ? `${durationMinutes / 60}H` : `${durationMinutes}M`;
    const code = `ARGUS-INV-${randomSuffix}-${durationLabel}`;

    const expiresDate = new Date(Date.now() + durationMinutes * 60 * 1000);
    const expiresAt = expiresDate.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newInvite: AdminInviteCode = {
      id: `inv-${Date.now()}`,
      code,
      createdBy: `${userName} (Owner)`,
      targetRole: selectedRole,
      durationMinutes,
      expiresAt: `Heute um ${expiresAt}`,
      permissions: selectedPermissions,
      used: false,
      createdAt: new Date().toLocaleTimeString('de-DE'),
    };

    setInviteCodes((prev) => [newInvite, ...prev]);

    // Add to Audit Log
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('de-DE'),
        actor: `${userName} (Owner)`,
        role: 'Owner',
        action: 'INVITE_CODE_CREATED',
        details: `Temporärer Zugangscode ${code} (${selectedRole}, Gültig: ${durationMinutes} Min) erstellt.`,
        severity: 'info',
      },
      ...prev,
    ]);
  };

  // Simulate Remote Maintenance Request from an Admin
  const handleSimulateRemoteRequest = () => {
    SoundFX.playAlert();
    const newSession: RemoteMaintenanceSession = {
      id: `remote-${Date.now()}`,
      requesterName: 'Techniker_Jonas',
      requesterRole: 'Senior Admin',
      reason: 'Diagnose und Performance-Optimierung der Serverraum-Klimasteuerung',
      ipAddress: '194.25.0.42 (VPN-Tunnel)',
      requestedAt: new Date().toLocaleTimeString('de-DE'),
      status: 'pending',
      recordingEnabled: false,
      userConsented: false,
    };

    setRemoteSession(newSession);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('de-DE'),
        actor: 'Techniker_Jonas',
        role: 'Senior Admin',
        action: 'REMOTE_MAINTENANCE_REQUEST',
        details: 'Fernwartungssitzung angefragt: Serverraum-Diagnose.',
        severity: 'warning',
      },
      ...prev,
    ]);
  };

  // Accept Remote Maintenance Session (User explicit consent)
  const handleAcceptSession = () => {
    if (!remoteSession) return;
    SoundFX.playConfirm();

    setRemoteSession({
      ...remoteSession,
      status: 'active',
      userConsented: true,
      recordingEnabled: recordConsent,
      startedAt: new Date().toLocaleTimeString('de-DE'),
    });

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('de-DE'),
        actor: `${userName} (Owner)`,
        role: 'Owner',
        action: 'REMOTE_MAINTENANCE_ACCEPTED',
        details: `Fernwartung für ${remoteSession.requesterName} autorisiert. Aufzeichnung: ${
          recordConsent ? 'AKTIVIERT' : 'DEAKTIVIERT'
        }.`,
        severity: 'security',
      },
      ...prev,
    ]);
  };

  // Terminate / Reject Remote Session (Immediate Kill)
  const handleTerminateSession = () => {
    if (!remoteSession) return;
    SoundFX.playLock();

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('de-DE'),
        actor: `${userName} (Owner)`,
        role: 'Owner',
        action: 'REMOTE_MAINTENANCE_TERMINATED',
        details: `Fernwartungssitzung mit ${remoteSession.requesterName} sofort beendet und getrennt.`,
        severity: 'warning',
      },
      ...prev,
    ]);

    setRemoteSession(null);
    alert('ARGUS Fernwartung: Sitzung sofort beendet und Remote-Tunnel getrennt.');
  };

  const handleRevokeInvite = (id: string) => {
    SoundFX.playToggle();
    setInviteCodes((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Admin-Rollen, Einladungscodes & Fernwartung
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Owner-Rechteverwaltung, zeitlich befristete Zugangstoken und DSGVO-konforme Sitzungskontrolle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRemoteRequest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] border border-[#222] hover:border-orange-500/50 text-orange-400 text-xs font-mono transition-all uppercase tracking-wider"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Fernwartungs-Anfrage simulieren</span>
          </button>
        </div>
      </div>

      {/* ACTIVE REMOTE MAINTENANCE MODAL / BANNER */}
      {remoteSession && (
        <div
          className={`p-4 rounded-lg border transition-all ${
            remoteSession.status === 'active'
              ? 'bg-[#18120d] border-orange-500'
              : 'bg-[#141414] border-orange-500/80'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-gray-100 uppercase tracking-wider">
                    {remoteSession.status === 'active'
                      ? '🔴 Aktive Fernwartungs-Sitzung'
                      : '⚠️ Anfrage auf Fernwartung eingegangen'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111] border border-[#222] text-orange-400">
                    {remoteSession.requesterRole}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-300 mt-1">
                  Antragsteller: <span className="font-bold text-gray-100">{remoteSession.requesterName}</span> ({remoteSession.ipAddress})
                </p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">
                  Grund: {remoteSession.reason}
                </p>
                {remoteSession.status === 'active' && (
                  <p className="text-[11px] font-mono text-orange-400 mt-1">
                    Aufzeichnung: {remoteSession.recordingEnabled ? 'Aktiviert (DSGVO-Audit)' : 'Deaktiviert'} • Gestartet: {remoteSession.startedAt}
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Accept or Kill Session */}
            <div className="flex items-center gap-2">
              {remoteSession.status === 'pending' ? (
                <>
                  <div className="flex items-center gap-2 mr-3 text-xs font-mono text-gray-400">
                    <input
                      type="checkbox"
                      id="check-record-consent"
                      checked={recordConsent}
                      onChange={(e) => setRecordConsent(e.target.checked)}
                      className="accent-orange-500 rounded"
                    />
                    <label htmlFor="check-record-consent">
                      Sitzung aufzeichnen (Einverständnis)
                    </label>
                  </div>

                  <button
                    onClick={handleAcceptSession}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Zulassen & Starten</span>
                  </button>

                  <button
                    onClick={handleTerminateSession}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-950/60 border border-red-900/80 hover:bg-red-900/60 text-red-200 text-xs font-mono uppercase tracking-wider"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Ablehnen</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleTerminateSession}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider"
                >
                  <Square className="w-4 h-4" />
                  <span>Sitzung sofort beenden</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Invite Code Generator + Active Codes + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Invite Generator */}
        <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Zeitlich begrenzten Admin-Code erstellen
          </h3>

          <form onSubmit={handleGenerateInvite} className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                Ziel-Rolle
              </label>
              <select
                value={selectedRole}
                onChange={(e: any) => setSelectedRole(e.target.value)}
                className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
              >
                <option value="Senior Admin">Senior Admin (Wartung & Server)</option>
                <option value="Operator">Operator (Smart Home & Monitoring)</option>
                <option value="Guest">Gast (Nur Lesezugriff)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                Gültigkeitsdauer
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
              >
                <option value={15}>15 Minuten (Express-Wartung)</option>
                <option value={60}>1 Stunde (Standard-Audit)</option>
                <option value={1440}>24 Stunden (Tagespass)</option>
                <option value={10080}>7 Tage (Projektphase)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">
                Granulare Berechtigungen
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {availablePermissions.map((perm) => (
                  <button
                    type="button"
                    key={perm}
                    onClick={() => handleTogglePermission(perm)}
                    className={`p-1.5 rounded text-[10px] font-mono text-left transition-colors flex items-center justify-between ${
                      selectedPermissions.includes(perm)
                        ? 'bg-orange-500/10 border border-orange-500/40 text-orange-400'
                        : 'bg-[#141414] border border-[#222] text-gray-500'
                    }`}
                  >
                    <span>{perm}</span>
                    {selectedPermissions.includes(perm) && (
                      <CheckCircle className="w-3 h-3 text-orange-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold transition-all uppercase tracking-wider"
            >
              Einladungscode Generieren
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Active Invite Codes & Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Codes List */}
          <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              Aktive Einladungstoken ({inviteCodes.length})
            </h3>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {inviteCodes.length === 0 ? (
                <p className="text-xs font-mono text-gray-500 italic text-center py-3">
                  Keine aktiven Einladungscodes vorhanden.
                </p>
              ) : (
                inviteCodes.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2.5 rounded bg-[#141414] border border-[#222] flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-400">{inv.code}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#111] border border-[#222] text-gray-400">
                          {inv.targetRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Läuft ab: {inv.expiresAt} • Berechtigungen: {inv.permissions.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          SoundFX.playConfirm();
                          navigator.clipboard.writeText(inv.code);
                          alert(`Code kopiert: ${inv.code}`);
                        }}
                        className="p-1.5 rounded bg-[#181818] border border-[#222] hover:border-orange-500 text-gray-400 hover:text-orange-400"
                        title="Code kopieren"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="p-1.5 rounded text-gray-600 hover:text-red-400"
                        title="Token widerrufen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Immutable Audit Log */}
          <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Unveränderliches Sicherheits-Audit-Protokoll ({auditLogs.length} Einträge)
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[11px]">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-[#141414] border border-[#222] flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-[10px]">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="text-orange-400 font-bold">{log.actor}</span>
                      <span>[{log.role}]</span>
                    </div>
                    <p className="text-gray-300 mt-0.5 text-xs">{log.details}</p>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                      log.severity === 'critical' || log.severity === 'security'
                        ? 'bg-red-950/80 border border-red-900/60 text-red-400'
                        : log.severity === 'warning'
                        ? 'bg-orange-950/80 border border-orange-500/40 text-orange-400'
                        : 'bg-[#181818] text-gray-500 border border-[#222]'
                    }`}
                  >
                    {log.action}
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
