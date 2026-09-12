import React from 'react';
import {
  Settings as SettingsIcon,
  User,
  Volume2,
  Mic,
  ShieldCheck,
  Palette,
  CheckCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ArgusSettings } from '../types';
import { SoundFX, ArgusVoice } from '../utils/audio';

interface SettingsViewProps {
  settings: ArgusSettings;
  setSettings: React.Dispatch<React.SetStateAction<ArgusSettings>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  setSettings,
}) => {
  const handleTestVoice = () => {
    SoundFX.playWakeChime();
    const salutation = settings.userName === 'Master' ? 'Master' : 'Matthias';
    const phrasing =
      settings.addressForm === 'Sie'
        ? `Guten Tag ${salutation}. Alle Systeme von ARGUS laufen mit optimaler Leistung. Wie kann ich Ihnen heute behilflich sein?`
        : `Hallo ${salutation}. Alle Systeme von ARGUS laufen einwandfrei. Was kann ich für dich tun?`;

    ArgusVoice.speak(phrasing, settings);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222]">
        <h2 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4" />
          ARGUS System- & Persönlichkeits-Konfiguration
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          Passen Sie Ansprache, Stimmcharakteristik, Wake-Word und Datenschutz-Präferenzen an.
        </p>
      </div>

      {/* Grid: 3 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Ansprache & Identität */}
        <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Ansprache & Benutzer-Identität
          </h3>

          {/* User Name Selector */}
          <div>
            <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase tracking-wider">
              Bevorzugte Namensansprache
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Master', 'Matthias'] as const).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    SoundFX.playToggle();
                    setSettings((prev) => ({ ...prev, userName: name }));
                  }}
                  className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all border uppercase tracking-wider ${
                    settings.userName === name
                      ? 'bg-orange-500 border-orange-500 text-black font-bold'
                      : 'bg-[#141414] border-[#222] text-gray-400 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Siezen vs Duzen Selector */}
          <div>
            <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase tracking-wider">
              Umgangston (Höflichkeitsform)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Sie', 'Du'] as const).map((form) => (
                <button
                  key={form}
                  onClick={() => {
                    SoundFX.playToggle();
                    setSettings((prev) => ({ ...prev, addressForm: form }));
                  }}
                  className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all border uppercase tracking-wider ${
                    settings.addressForm === form
                      ? 'bg-orange-500 border-orange-500 text-black font-bold'
                      : 'bg-[#141414] border-[#222] text-gray-400 hover:text-white'
                  }`}
                >
                  {form === 'Sie' ? 'Siezen (Formell)' : 'Duzen (Vertraut)'}
                </button>
              ))}
            </div>
          </div>

          {/* Wake Word Config */}
          <div className="pt-2">
            <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase tracking-wider">
              Sprachaktivierungs-Kommando (Wake Word)
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#141414] border border-[#222]">
              <Mic className="w-4 h-4 text-orange-400" />
              <input
                type="text"
                value={settings.wakeWord}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, wakeWord: e.target.value }))
                }
                className="bg-transparent text-xs font-mono font-bold text-orange-400 focus:outline-none flex-1"
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500 block mt-1">
              Beispiel: "Hey Argus, schalte die Lichter ein"
            </span>
          </div>
        </div>

        {/* Card 2: Professionelle männliche Stimme */}
        <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Professionelle Männliche Stimme
            </h3>

            <button
              onClick={handleTestVoice}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-600 text-black text-xs font-mono font-bold uppercase tracking-wider"
            >
              <Play className="w-3 h-3" />
              <span>Stimm-Test</span>
            </button>
          </div>

          {/* Voice Enable Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#141414] border border-[#222]">
            <span className="text-xs font-mono text-gray-300">Sprachsynthese (TTS) aktiv</span>
            <button
              onClick={() => {
                SoundFX.playToggle();
                setSettings((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                settings.voiceEnabled
                  ? 'bg-orange-500 text-black'
                  : 'bg-[#222] text-gray-500'
              }`}
            >
              {settings.voiceEnabled ? 'AKTIVIERT' : 'DEAKTIVIERT'}
            </button>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#141414] border border-[#222]">
            <span className="text-xs font-mono text-gray-300">Taktische Audio-Soundeffekte</span>
            <button
              onClick={() => {
                SoundFX.playToggle();
                setSettings((prev) => ({ ...prev, soundEffectsEnabled: !prev.soundEffectsEnabled }));
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                settings.soundEffectsEnabled
                  ? 'bg-orange-500 text-black'
                  : 'bg-[#222] text-gray-500'
              }`}
            >
              {settings.soundEffectsEnabled ? 'AKTIVIERT' : 'DEAKTIVIERT'}
            </button>
          </div>

          {/* Pitch & Rate Sliders */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Tonhöhe (Tiefe Männerstimme):</span>
                <span className="text-orange-400 font-bold">{settings.voicePitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={settings.voicePitch}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, voicePitch: parseFloat(e.target.value) }))
                }
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Sprechgeschwindigkeit:</span>
                <span className="text-orange-400 font-bold">{settings.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={settings.voiceRate}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, voiceRate: parseFloat(e.target.value) }))
                }
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Datenschutz & Rechtskonformität */}
      <div className="p-5 rounded-lg bg-[#0d0d0d] border border-[#222] space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Datenschutz, Rechtsvorschriften & Fernzugriffs-Zustimmung
        </h3>

        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          Gemäß den Sicherheitsrichtlinien von ARGUS erfolgen Kameraüberwachung, Biometrie-Erfassung und Fernwartung ausschließlich mit ausdrücklicher Zustimmung des Nutzers. Sitzungen können jederzeit mit einem Klick abgebrochen werden.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded bg-[#141414] border border-[#222] text-xs font-mono">
            <span className="text-orange-400 font-bold block mb-1">✓ DSGVO Konform</span>
            <span className="text-gray-500 text-[11px]">
              Verschlüsselte Biometrie-Hashes & lokale Profilverarbeitung.
            </span>
          </div>

          <div className="p-3 rounded bg-[#141414] border border-[#222] text-xs font-mono">
            <span className="text-orange-400 font-bold block mb-1">✓ Consent-Gate</span>
            <span className="text-gray-500 text-[11px]">
              Jede Fernwartung erfordert eine manuelle Autorisierung durch den Owner.
            </span>
          </div>

          <div className="p-3 rounded bg-[#141414] border border-[#222] text-xs font-mono">
            <span className="text-orange-400 font-bold block mb-1">✓ Kill-Switch</span>
            <span className="text-gray-500 text-[11px]">
              Sofortiger Not-Aus für alle Remote-Sitzungen jederzeit verfügbar.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
