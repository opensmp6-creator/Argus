import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Shield,
  ShieldAlert,
  Camera,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Lock,
  Smartphone,
  RefreshCw,
  Clock,
  Trash2,
} from 'lucide-react';
import { BiometricProfile, PushNotification } from '../types';
import { SoundFX } from '../utils/audio';

interface BiometricsSecurityViewProps {
  biometrics: BiometricProfile;
  setBiometrics: React.Dispatch<React.SetStateAction<BiometricProfile>>;
  onLockPc: () => void;
  onSendPushNotification: (notif: PushNotification) => void;
  userName: string;
}

export const BiometricsSecurityView: React.FC<BiometricsSecurityViewProps> = ({
  biometrics,
  setBiometrics,
  onLockPc,
  onSendPushNotification,
  userName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);

  // Initialize Webcam Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.warn('Camera access error or denied:', err);
        setCameraError('Webcam nicht verfügbar oder Berechtigung abgelehnt. Simulierter Biometrie-Sensor aktiv.');
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Lock countdown timer if intruder detected
  useEffect(() => {
    if (lockCountdown === null) return;
    if (lockCountdown <= 0) {
      onLockPc();
      setLockCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setLockCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [lockCountdown, onLockPc]);

  // Capture current video frame to base64 image data
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Register Face for Master
  const handleRegisterFace = () => {
    SoundFX.playConfirm();
    const photo = captureFrame();
    const dateStr = new Date().toLocaleString('de-DE');

    setBiometrics((prev) => ({
      ...prev,
      isRegistered: true,
      registeredName: `${userName} (Master)`,
      registeredPhoto: photo || undefined,
      registeredDate: dateStr,
      lastScanStatus: 'authorized',
      matchScore: 99.2,
    }));

    alert(`ARGUS Biometrie: Gesichtsprofil für ${userName} erfolgreich verschlüsselt und im Sicherheitsmodul gespeichert.`);
  };

  // Simulate Authorized Recognition (Master verified)
  const handleVerifyAuthorized = () => {
    SoundFX.playConfirm();
    setLockCountdown(null);
    setBiometrics((prev) => ({
      ...prev,
      lastScanStatus: 'authorized',
      matchScore: 98.6,
    }));
  };

  // Trigger Intruder Detection & Defense Protocol
  const handleTriggerIntruder = () => {
    SoundFX.playAlert();
    const intruderPhoto = captureFrame();
    const nowStr = new Date().toLocaleTimeString('de-DE');

    const newSnapshot = {
      id: `intruder-${Date.now()}`,
      timestamp: `Heute, ${nowStr}`,
      imageUrl: intruderPhoto || undefined,
      confidence: 14.2, // Low match -> intruder
      resolved: false,
    };

    setBiometrics((prev) => ({
      ...prev,
      lastScanStatus: 'intruder',
      matchScore: 14.2,
      intruderSnapshots: [newSnapshot, ...prev.intruderSnapshots],
    }));

    // Send push notification to mobile app
    onSendPushNotification({
      id: `notif-intruder-${Date.now()}`,
      title: '🚨 SICHERHEITSALARM: Unbekannte Person!',
      message: `Unbekannte Person an Terminal 01 erkannt. Biometrie-Konfidenz nur 14.2%.`,
      type: 'security',
      timestamp: 'Gerade eben',
      read: false,
      urgent: true,
    });

    // Start auto-lock countdown (10s)
    setLockCountdown(10);
  };

  const handleResolveSnapshot = (id: string) => {
    SoundFX.playToggle();
    setBiometrics((prev) => ({
      ...prev,
      intruderSnapshots: prev.intruderSnapshots.map((s) =>
        s.id === id ? { ...s, resolved: true } : s
      ),
    }));
  };

  const handleDeleteSnapshot = (id: string) => {
    SoundFX.playToggle();
    setBiometrics((prev) => ({
      ...prev,
      intruderSnapshots: prev.intruderSnapshots.filter((s) => s.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            Biometrische Gesichtserkennung & Eindringling-Schutz
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Echtzeit-Kameraüberwachung mit neuronaler Gesichtserkennung, automatischer PC-Sperre und mobilen Push-Warnungen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegisterFace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs font-bold transition-all uppercase tracking-wider"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Gesicht für {userName} registrieren</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Camera HUD View */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0d0d0d] border border-[#222] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                Live Sensor Feed (Optischer Scan-Trakt)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyAuthorized}
                className="px-2.5 py-1 rounded bg-[#141414] border border-[#222] hover:border-green-500/50 text-green-400 text-xs font-mono transition-all"
              >
                Als Master autorisieren
              </button>
              <button
                onClick={handleTriggerIntruder}
                className="px-2.5 py-1 rounded bg-red-950/40 border border-red-900/60 hover:bg-red-900/60 text-red-300 text-xs font-mono font-bold transition-all"
              >
                Eindringling simulieren
              </button>
            </div>
          </div>

          {/* Camera View Area with Sci-Fi HUD Overlay */}
          <div className="relative w-full aspect-video rounded-lg bg-black overflow-hidden border border-[#222] flex items-center justify-center">
            {/* Real Webcam Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Fallback Display if no camera */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#070707]">
                <div className="w-16 h-16 rounded-full border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3">
                  <Eye className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-mono font-bold text-gray-200 uppercase tracking-wider">
                  Simulierter Biometrie-Sensor Aktiv
                </h4>
                <p className="text-xs font-mono text-gray-500 mt-1 max-w-sm">
                  {cameraError || 'Kamerazugriff aktiv im Testmodus. Gesichtserkennungs-Algorithmus bereit.'}
                </p>
              </div>
            )}

            {/* Scanlines & Radar Overlay */}
            <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />

            {/* Sci-Fi Target Bounding Box */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
              <div
                className={`relative w-48 h-60 rounded border transition-all duration-300 ${
                  biometrics.lastScanStatus === 'intruder'
                    ? 'border-red-500 scale-105'
                    : 'border-orange-500/80'
                }`}
              >
                {/* Corner Marks */}
                <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-orange-400" />
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-orange-400" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-orange-400" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-orange-400" />

                {/* Vertical Scanning Laser line */}
                <div className="w-full h-0.5 bg-orange-400 animate-bounce mt-10" />

                {/* Floating HUD Label */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded bg-black border border-[#222] font-mono text-[10px] text-orange-400">
                  {biometrics.lastScanStatus === 'intruder'
                    ? '⚠️ UNBEKANNTE PERSON [14.2%]'
                    : `BIOMETRIE MATCH: ${biometrics.matchScore}%`}
                </div>
              </div>
            </div>

            {/* Telemetry Corner Overlays */}
            <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded border border-[#222] text-[10px] font-mono text-gray-400">
              ARGUS FACE-ID v1.0 • 60 FPS
            </div>

            {/* Auto-Lock Alert Warning Banner if Intruder Active */}
            {lockCountdown !== null && (
              <div className="absolute bottom-4 inset-x-4 p-3 rounded bg-red-950/95 border border-red-800 text-white font-mono text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="font-bold">EINDRINGLING-DEFENSIVE AKTIV!</span>
                    <p className="text-[11px] text-red-200">
                      Automatischer PC-Lockdown in <span className="font-bold text-white text-sm">{lockCountdown}s</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    SoundFX.playConfirm();
                    setLockCountdown(null);
                    setBiometrics((prev) => ({ ...prev, lastScanStatus: 'authorized', matchScore: 98.4 }));
                  }}
                  className="px-3 py-1.5 rounded bg-white text-red-950 font-bold hover:bg-zinc-200 transition-colors"
                >
                  Abbrechen / Autorisieren
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Registered Profile & Intruder Audit Log */}
        <div className="space-y-4">
          {/* Master Biometric Profile Card */}
          <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4" />
              Registriertes Master-Profil
            </h3>

            {biometrics.isRegistered ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {biometrics.registeredPhoto ? (
                    <img
                      src={biometrics.registeredPhoto}
                      alt="Master"
                      className="w-14 h-14 rounded object-cover border border-[#222]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded bg-[#141414] border border-[#222] flex items-center justify-center text-orange-400 font-bold font-mono">
                      {userName[0]}
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{biometrics.registeredName}</h4>
                    <span className="text-[10px] font-mono text-green-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" /> Biometrisch Verifiziert
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                      Registriert: {biometrics.registeredDate || 'Heute'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#141414] border border-[#222] text-xs font-mono text-gray-400 flex items-center justify-between">
                  <span>Sicherheitslevel:</span>
                  <span className="text-orange-400 font-bold">STUFE 5 (ROOT OWNER)</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded bg-[#141414] border border-[#222] text-center">
                <p className="text-xs font-mono text-gray-500 mb-3">
                  Noch kein Gesicht für {userName} registriert.
                </p>
                <button
                  onClick={handleRegisterFace}
                  className="px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs font-bold uppercase tracking-wider"
                >
                  Jetzt Scannen & Speichern
                </button>
              </div>
            )}
          </div>

          {/* Intruder Snapshots & Security Log */}
          <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-3">
              <UserX className="w-4 h-4" />
              Sicherheits-Snapshots ({biometrics.intruderSnapshots.length})
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {biometrics.intruderSnapshots.length === 0 ? (
                <p className="text-xs font-mono text-gray-600 italic text-center py-4">
                  Keine unbefugten Zugriffsversuche verzeichnet.
                </p>
              ) : (
                biometrics.intruderSnapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-2.5 rounded bg-[#141414] border border-[#222] flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      {snap.imageUrl ? (
                        <img
                          src={snap.imageUrl}
                          alt="Intruder"
                          className="w-10 h-10 rounded object-cover border border-red-900/60"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-red-950/60 border border-red-900/60 flex items-center justify-center text-red-400 font-bold">
                          ?
                        </div>
                      )}
                      <div>
                        <span className="text-red-400 font-bold block">Unbekannte Person</span>
                        <span className="text-[10px] text-gray-500">{snap.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!snap.resolved ? (
                        <button
                          onClick={() => handleResolveSnapshot(snap.id)}
                          className="px-2 py-1 rounded bg-[#1c1c1c] hover:bg-[#252525] text-[10px] text-gray-300 border border-[#222]"
                        >
                          Quittieren
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-400">Erledigt</span>
                      )}
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
