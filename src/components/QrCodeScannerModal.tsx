import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Keyboard, ShieldAlert, RefreshCw, Smartphone } from 'lucide-react';
import { SoundFX } from '../utils/audio';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeDetected: (code: string) => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onCodeDetected,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [useCamera, setUseCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (useCamera) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, useCamera]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Kamera wird von diesem Browser nicht unterstützt.');
        setUseCamera(false);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Kamera-Zugriff verweigert oder nicht verfügbar.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    SoundFX.playConfirm();
    onCodeDetected(manualCode.trim().toUpperCase());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col font-mono">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Mit ARGUS PC-Host koppeln
            </h3>
          </div>
          <button
            onClick={() => {
              SoundFX.playToggle();
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Toggle between Camera & PIN input */}
          <div className="flex items-center gap-2 p-1 bg-[#181818] rounded-lg border border-[#222] text-[11px]">
            <button
              onClick={() => setUseCamera(true)}
              className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition-all ${
                useCamera ? 'bg-orange-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>QR-Kamera</span>
            </button>
            <button
              onClick={() => {
                setUseCamera(false);
                stopCamera();
              }}
              className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition-all ${
                !useCamera ? 'bg-orange-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Code-Eingabe</span>
            </button>
          </div>

          {useCamera ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-square border border-[#333] flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Scanning Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-48 border-2 border-orange-500/70 rounded-2xl relative shadow-[0_0_20px_#f97316]/20 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-orange-400 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_10px_#f97316]" />
                  <span className="text-[10px] text-orange-400/90 font-mono tracking-widest uppercase bg-black/60 px-2 py-0.5 rounded">
                    QR-Code im Rahmen halten
                  </span>
                </div>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/90 p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-amber-500" />
                  <p className="text-xs text-gray-300">{cameraError}</p>
                  <button
                    onClick={() => setUseCamera(false)}
                    className="px-3 py-1.5 rounded bg-orange-500 text-black text-xs font-bold uppercase mt-2"
                  >
                    Code manuell eingeben
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4 py-2">
              <div>
                <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1.5">
                  6-Stelligen ARGUS Host-Code eingeben
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  maxLength={12}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="z.B. ARG-8842"
                  className="w-full bg-[#141414] border-2 border-[#333] focus:border-orange-500 rounded-xl px-4 py-3 text-center text-lg font-bold font-mono tracking-[0.2em] text-orange-400 uppercase focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed">
                Der Host-Code wird auf dem PC-Bildschirm im Menüpunkt <strong>"Mobile Companion"</strong> angezeigt.
              </p>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_#f97316]/30"
              >
                <Check className="w-4 h-4" />
                <span>Verbindung herstellen</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#141414] border-t border-[#222] flex items-center justify-between text-[10px] text-gray-500">
          <span>ARGUS Global Mesh Relay</span>
          <span className="text-orange-400">AES-256 E2E</span>
        </div>
      </div>
    </div>
  );
};
