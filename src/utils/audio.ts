/**
 * ARGUS Audio Synthesizer & Speech Engine
 * Generates futuristic sci-fi sound effects and deep professional male voice synthesis.
 */
import { ArgusSettings } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const SoundFX = {
  // ARGUS wake word activation chime
  playWakeChime: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Dual tone pulse
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now); // A4
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(660, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.22);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  },

  // Tactical click / command confirmation
  playConfirm: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  },

  // Tactical switch toggle
  playToggle: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  },

  // Warning / Intruder Alert
  playAlert: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.15);
      osc.frequency.linearRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  },

  // Heavy containment breach siren (3 pulses)
  playBreachAlarm: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const pulseStart = now + i * 0.45;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, pulseStart);
        osc.frequency.linearRampToValueAtTime(800, pulseStart + 0.2);
        osc.frequency.linearRampToValueAtTime(300, pulseStart + 0.4);

        gain.gain.setValueAtTime(0.25, pulseStart);
        gain.gain.exponentialRampToValueAtTime(0.005, pulseStart + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(pulseStart);
        osc.stop(pulseStart + 0.42);
      }
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  },

  // Lock / Shutdown sound
  playLock: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  },
};

/**
 * Speech synthesis for ARGUS: Professional, deep male German voice
 */
export function speakArgus(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    voiceName?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // Stop any pending speech

  const cleanText = text.replace(/[*_#`]/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'de-DE';
  // Deep male voice configuration (pitch 0.85, rate 1.0)
  utterance.pitch = options?.pitch ?? 0.85;
  utterance.rate = options?.rate ?? 1.02;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    // Look for German male voices
    let selectedVoice = voices.find(
      (v) =>
        v.lang.startsWith('de') &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('stefan') ||
          v.name.toLowerCase().includes('martin') ||
          v.name.toLowerCase().includes('hans') ||
          v.name.toLowerCase().includes('conrad') ||
          v.name.toLowerCase().includes('bernd') ||
          v.name.toLowerCase().includes('deutsch (deutschland)'))
    );

    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.lang.startsWith('de'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    options?.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export const ArgusVoice = {
  speak: (text: string, settings?: ArgusSettings, callbacks?: { onStart?: () => void; onEnd?: () => void }) => {
    speakArgus(text, {
      pitch: settings?.voicePitch ?? 0.85,
      rate: settings?.voiceRate ?? 1.02,
      onStart: callbacks?.onStart,
      onEnd: callbacks?.onEnd,
    });
  },
  stop: stopSpeaking,
};
