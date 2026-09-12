import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Radio,
  Sparkles,
  Volume2,
  Trash2,
  Cpu,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { ArgusSettings, VoiceDialogueTurn } from '../types';
import { SoundFX, speakArgus, stopSpeaking } from '../utils/audio';
import { processArgusLocalBrain } from '../utils/aiCore';

interface VoiceAssistantWidgetProps {
  settings: ArgusSettings;
  dialogueHistory: VoiceDialogueTurn[];
  setDialogueHistory: React.Dispatch<React.SetStateAction<VoiceDialogueTurn[]>>;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (val: boolean) => void;
  onExecuteCommandAction?: (action: any) => void;
  contextState: any;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  settings,
  dialogueHistory,
  setDialogueHistory,
  isListening,
  setIsListening,
  isSpeaking,
  setIsSpeaking,
  onExecuteCommandAction,
  contextState,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of dialogue
  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory]);

  // Web Speech API Initialization for Voice & Wake-word detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleFinalSpeechInput(transcriptChunk.trim());
          } else {
            currentInterim += transcriptChunk;
          }
        }
        setTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still listening
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already started or busy
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition not available:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Toggle speech listener
  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already running
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch {
        // Stopped
      }
    }
  }, [isListening]);

  const handleFinalSpeechInput = (text: string) => {
    if (!text) return;
    setTranscript('');

    const lower = text.toLowerCase();
    const wakePhrases = ['hey argus', 'argus', 'hallo argus', 'ok argus'];
    const matchedWake = wakePhrases.some((p) => lower.includes(p));

    if (matchedWake || !settings.wakeWordEnabled) {
      SoundFX.playWakeChime();
      // Clean query by removing wake words if present
      let cleanQuery = text;
      wakePhrases.forEach((phrase) => {
        const regex = new RegExp(`^${phrase}[,\\s]*`, 'i');
        cleanQuery = cleanQuery.replace(regex, '');
      });
      if (!cleanQuery.trim()) {
        const title = settings.userName || 'Master';
        const defaultPrompt = settings.addressForm === 'Sie'
          ? `Ja, ${title}? Ich höre zu.`
          : `Ja, ${title}? Was gibt's?`;
        speakResponse(defaultPrompt);
        return;
      }
      handleSendPrompt(cleanQuery.trim());
    }
  };

  const speakResponse = (text: string) => {
    if (!settings.voiceEnabled) return;
    setIsSpeaking(true);
    speakArgus(text, {
      pitch: settings.voicePitch,
      rate: settings.voiceRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleSendPrompt = async (messageText: string) => {
    if (!messageText.trim() || isProcessing) return;

    SoundFX.playConfirm();
    setIsProcessing(true);
    setInputText('');

    const userTurn: VoiceDialogueTurn = {
      id: `turn-${Date.now()}-user`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

    setDialogueHistory((prev) => [...prev, userTurn]);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/argus/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            settings,
            context: contextState,
          }),
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (networkErr) {
        console.info('Switching to local ARGUS autonomous core:', networkErr);
      }

      // If backend was not reached or returned no reply, use Autonomous Local AI Brain
      if (!data || !data.replyText) {
        data = processArgusLocalBrain(messageText, settings, contextState);
      }

      const title = settings.userName || 'Master';
      const replyText =
        data.replyText ||
        (settings.addressForm === 'Sie'
          ? `Befehl ausgeführt, ${title}.`
          : `Erledigt, ${title}!`);

      const executedActions: string[] = [];

      if (data.actions && Array.isArray(data.actions)) {
        data.actions.forEach((act: any) => {
          executedActions.push(`${act.type}: ${act.target || act.value || ''}`);
          if (onExecuteCommandAction) {
            onExecuteCommandAction(act);
          }
        });
      }

      // Extra deterministic keyword triggers
      const lower = messageText.toLowerCase();
      if (lower.includes('sperre') && lower.includes('pc')) {
        onExecuteCommandAction?.({ type: 'LOCK_PC' });
      } else if (lower.includes('licht') || lower.includes('beleuchtung')) {
        if (lower.includes('aus')) {
          onExecuteCommandAction?.({ type: 'TOGGLE_SMART_DEVICE', target: 'dev-1', value: false });
        } else {
          onExecuteCommandAction?.({ type: 'TOGGLE_SMART_DEVICE', target: 'dev-1', value: true });
        }
      } else if (lower.includes('minecraft') && (lower.includes('start') || lower.includes('öffne'))) {
        onExecuteCommandAction?.({ type: 'LAUNCH_APP', target: 'app-minecraft-srv' });
      } else if (lower.includes('containment') || lower.includes('lockdown') || lower.includes('abriegeln')) {
        onExecuteCommandAction?.({ type: 'TRIGGER_CONTAINMENT_LOCKDOWN' });
      }

      const argusTurn: VoiceDialogueTurn = {
        id: `turn-${Date.now()}-argus`,
        sender: 'argus',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        actionsExecuted: executedActions.length > 0 ? executedActions : undefined,
      };

      setDialogueHistory((prev) => [...prev, argusTurn]);
      speakResponse(replyText);
    } catch (err: any) {
      console.warn('Handling through ARGUS Local Brain:', err);
      const fallbackResult = processArgusLocalBrain(messageText, settings, contextState);
      const argusTurn: VoiceDialogueTurn = {
        id: `turn-${Date.now()}-argus`,
        sender: 'argus',
        text: fallbackResult.replyText,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      };
      setDialogueHistory((prev) => [...prev, argusTurn]);
      speakResponse(fallbackResult.replyText);
    } finally {
      setIsProcessing(false);
    }
  };

  const samplePrompts = [
    'Systemstatus und Hardware-Auslastung melden',
    'Starte Minecraft Server und aktiviere RCON',
    'Schalte alle Ambient-Lichter auf Cyber-Orange',
    'Prüfe Status von SCP-682 und SCP-049',
    'Erinnerung: Server-Backup um 18:00 Uhr anlegen',
    'Sperre das System und aktiviere Sicherheitsmodus',
  ];

  return (
    <div className="relative flex flex-col h-full bg-[#111] border border-[#222] rounded-lg overflow-hidden">
      {/* Left Vertical Brand Accent Line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 z-20" />

      {/* Voice Visualizer Orb / Header */}
      <div className="relative p-5 bg-[#0d0d0d] border-b border-[#222]">
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-widest text-orange-400 uppercase">
              Voice Core Interface
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Visual audio bars indicator */}
            <div className="flex gap-1 items-center">
              <div className="w-1 h-3 bg-orange-500/30" />
              <div className="w-1 h-3 bg-orange-500/30" />
              <div className="w-1 h-3 bg-orange-500" />
            </div>

            {dialogueHistory.length > 0 && (
              <button
                onClick={() => {
                  SoundFX.playToggle();
                  setDialogueHistory([]);
                  stopSpeaking();
                }}
                className="p-1 rounded text-gray-500 hover:text-orange-400 transition-colors ml-2"
                title="Verlauf löschen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161616] border border-[#222] text-[10px] font-mono text-orange-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? 'bg-orange-400 animate-ping'
                    : isProcessing
                    ? 'bg-orange-500 animate-spin'
                    : isListening
                    ? 'bg-orange-500 animate-pulse'
                    : 'bg-gray-700'
                }`}
              />
              <span>
                {isSpeaking
                  ? 'ARGUS SPRICHT'
                  : isProcessing
                  ? 'PROCESSING'
                  : isListening
                  ? 'LISTENING'
                  : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Central Futuristic Voice Orb Animation */}
        <div className="flex flex-col items-center justify-center my-6 gap-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Outer radar pulse ring */}
            <div
              className={`absolute w-full h-full border rounded-full transition-all ${
                isSpeaking
                  ? 'border-orange-500/50 animate-ping'
                  : isListening
                  ? 'border-orange-500/30 animate-pulse'
                  : 'border-gray-800'
              }`}
            />

            {/* Middle ring */}
            <div
              className={`absolute w-24 h-24 border rounded-full ${
                isSpeaking || isListening ? 'border-orange-500/40 animate-radar' : 'border-gray-800'
              }`}
            />

            {/* Glowing Core Sphere */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                  setIsSpeaking(false);
                } else {
                  SoundFX.playWakeChime();
                  setIsListening(!isListening);
                }
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeaking
                  ? 'bg-orange-500/30 scale-110 shadow-[0_0_20px_#f97316]'
                  : isListening
                  ? 'bg-orange-500/20 shadow-[0_0_15px_#f97316]'
                  : 'bg-gray-900 border border-[#222] hover:border-orange-500/50'
              }`}
              title="Klicken um Voice Assistant umzuschalten"
            >
              {isSpeaking ? (
                <Volume2 className="w-6 h-6 text-orange-400 animate-bounce" />
              ) : isListening ? (
                <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316]" />
              ) : (
                <MicOff className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em]">
            {isListening ? "Listening for: 'Hey Argus'" : "Voice Standby"}
          </p>

          {/* Live speech transcription text if talking */}
          {transcript && (
            <div className="text-xs font-mono text-orange-300 italic bg-orange-950/20 px-3 py-1 rounded border border-orange-900/40">
              "{transcript}"
            </div>
          )}
        </div>

        {/* Quick Command Prompt Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pl-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#141414] border border-[#222] hover:border-orange-500/50 text-gray-400 hover:text-orange-400 text-[11px] font-mono whitespace-nowrap transition-colors"
            >
              <Sparkles className="w-2.5 h-2.5 text-orange-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dialogue Conversation Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[160px] max-h-[300px] bg-[#0d0d0d]/60 font-mono text-xs pl-5">
        {dialogueHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-500">
            <Terminal className="w-8 h-8 mb-2 text-orange-500/30" />
            <p className="font-medium text-gray-400">ARGUS Kommunikationskanal bereit</p>
            <p className="text-[11px] text-gray-600 mt-1 max-w-xs">
              Sagen Sie <span className="text-orange-400 font-semibold">"Hey Argus"</span> oder tippen Sie einen Befehl ein.
            </p>
          </div>
        ) : (
          dialogueHistory.map((turn) => {
            const isArgus = turn.sender === 'argus';
            return (
              <div
                key={turn.id}
                className={`flex flex-col ${isArgus ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-gray-600">
                  <span>{isArgus ? 'ARGUS CORE' : settings.userName || 'MASTER'}</span>
                  <span>•</span>
                  <span>{turn.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded p-3 ${
                    isArgus
                      ? 'bg-[#141414] border border-orange-900/40 text-gray-200'
                      : 'bg-orange-500/10 border border-orange-500/40 text-orange-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{turn.text}</p>

                  {turn.actionsExecuted && turn.actionsExecuted.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#222] flex flex-wrap gap-1.5">
                      {turn.actionsExecuted.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-[10px] text-orange-400 border border-orange-900/50"
                        >
                          <CheckCircle2 className="w-3 h-3 text-orange-500" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={dialogueEndRef} />
      </div>

      {/* Interactive Command Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputText);
        }}
        className="p-3 bg-[#0d0d0d] border-t border-[#222] flex items-center gap-2 pl-5"
      >
        <div className="relative flex-1">
          <input
            id="input-argus-command"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Befehl an ARGUS eingeben (z.B. "Sperre PC")...`}
            disabled={isProcessing}
            className="w-full bg-[#141414] border border-[#222] focus:border-orange-500 rounded px-3.5 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none transition-all"
          />
          <Cpu className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
        </div>

        <button
          id="btn-send-argus-command"
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="flex items-center justify-center p-2 rounded bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:hover:bg-orange-500 text-black shadow-[0_0_10px_#f97316]/40 transition-all font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
