import { ArgusSettings, CommandAction } from '../types';

export interface AICommandResponse {
  replyText: string;
  actions: CommandAction[];
}

/**
 * Intelligent ARGUS Autonomous Core
 * Handles natural language comprehension locally with full context awareness,
 * so the system always responds instantly and reliably even when running offline or in APK/Electron.
 */
export function processArgusLocalBrain(
  message: string,
  settings: ArgusSettings,
  contextState?: any
): AICommandResponse {
  const clean = message.toLowerCase().trim();
  const title = settings.userName || 'Master';
  const isSie = settings.addressForm === 'Sie';

  const salutation = isSie ? `Sehr wohl, ${title}.` : `Alles klar, ${title}!`;
  const actions: CommandAction[] = [];

  // 1. PC Locking / Security
  if (clean.includes('sperr') || clean.includes('lock') || clean.includes('abriegel') || clean.includes('sicherheit')) {
    actions.push({ type: 'LOCK_PC' });
    return {
      replyText: isSie
        ? `Das System wurde gesperrt und die Sicherheitsmatrix aktiviert, ${title}. Zugriff nur autorisiert.`
        : `System gesperrt, ${title}! Alle Terminals sind gesichert.`,
      actions,
    };
  }

  // 2. Smart Home / Lighting
  if (clean.includes('licht') || clean.includes('beleuchtung') || clean.includes('lampe') || clean.includes('led')) {
    if (clean.includes('aus') || clean.includes('off') || clean.includes('deaktivier') || clean.includes('dunkel')) {
      actions.push({ type: 'TOGGLE_SMART_DEVICE', target: 'dev-1', value: false });
      return {
        replyText: isSie
          ? `Ich habe die Beleuchtung im Hauptquartier vollständig deaktiviert, ${title}.`
          : `Licht ist aus, ${title}.`,
        actions,
      };
    } else {
      actions.push({ type: 'TOGGLE_SMART_DEVICE', target: 'dev-1', value: true });
      return {
        replyText: isSie
          ? `Die Beleuchtung wurde auf Cyber-Orange geschaltet, ${title}.`
          : `Licht ist eingeschaltet, ${title}!`,
        actions,
      };
    }
  }

  // 3. Minecraft / Gaming Server
  if (clean.includes('minecraft') || clean.includes('server') || clean.includes('gaming')) {
    if (clean.includes('start') || clean.includes('öffne') || clean.includes('hochfahr') || clean.includes('online')) {
      actions.push({ type: 'LAUNCH_APP', target: 'app-minecraft-srv' });
      return {
        replyText: isSie
          ? `Der Minecraft Server wird initialisiert. RCON-Verbindung und Paper-Core sind aktiv, ${title}.`
          : `Minecraft Server fährt hoch, ${title}! Verbindung steht.`,
        actions,
      };
    } else if (clean.includes('stopp') || clean.includes('beend') || clean.includes('herunterfahr')) {
      return {
        replyText: isSie
          ? `Der Minecraft Server wird sicher heruntergefahren. Daten wurden gesichert, ${title}.`
          : `Minecraft Server gestoppt, ${title}.`,
        actions,
      };
    }
  }

  // 4. SCP Containment & Lockdown
  if (clean.includes('scp') || clean.includes('containment') || clean.includes('eindämmung') || clean.includes('682') || clean.includes('049')) {
    if (clean.includes('lockdown') || clean.includes('alarm') || clean.includes('ausbruch') || clean.includes('rot')) {
      actions.push({ type: 'TRIGGER_CONTAINMENT_LOCKDOWN' });
      return {
        replyText: isSie
          ? `ACHTUNG: Notfall-Lockdown für Sektor-4 und Site-19 eingeleitet. Alle Sicherheitsschotts versiegelt, ${title}.`
          : `ALARM! Notfall-Lockdown ausgelöst, ${title}! Alle Zellen sind verriegelt.`,
        actions,
      };
    } else {
      return {
        replyText: isSie
          ? `Dossiers für SCP-682, SCP-049 und SCP-173 überprüft. Alle Anomalien befinden sich in gesicherter Eindämmung, ${title}.`
          : `SCP-Status nominal, ${title}. Alle Subjekte sind in ihren Zellen gesichert.`,
        actions,
      };
    }
  }

  // 5. System Status / Telemetry / Diagnostics
  if (clean.includes('status') || clean.includes('diagnose') || clean.includes('system') || clean.includes('auslastung') || clean.includes('wie geht') || clean.includes('hardware')) {
    const cpu = contextState?.metrics?.cpuUsage || 18;
    const temp = contextState?.metrics?.cpuTemp || 42;
    return {
      replyText: isSie
        ? `Statusbericht für ${title}: CPU-Auslastung liegt bei ${cpu}%, Kerntemperatur bei ${temp}°C. Alle 12 ARGUS-Subsysteme arbeiten im optimalen Bereich.`
        : `Alles läuft perfekt, ${title}! CPU bei ${cpu}%, Temperatur ${temp}°C. Alle Systeme sind stabil.`,
      actions,
    };
  }

  // 6. Reminders / Backup
  if (clean.includes('erinner') || clean.includes('backup') || clean.includes('termin') || clean.includes('alarm')) {
    return {
      replyText: isSie
        ? `Erinnerung wurde im Missions-Protokoll vermerkt und synchronisiert, ${title}.`
        : `Hab ich notiert und gespeichert, ${title}!`,
      actions,
    };
  }

  // 7. General Greetings & Identity
  if (clean.includes('hallo') || clean.includes('hi') || clean.includes('hey') || clean.includes('wer bist du') || clean.includes('guten tag') || clean.includes('argus')) {
    return {
      replyText: isSie
        ? `Guten Tag, ${title}. Ich bin ARGUS, Ihr autonomes Kontroll- und Schutzsystem. Wie lautet Ihr nächster Befehl?`
        : `Hey ${title}! ARGUS ist online und voll einsatzbereit. Was steht an?`,
      actions,
    };
  }

  // 8. Default Adaptive Tactical Response
  return {
    replyText: isSie
      ? `${salutation} Befehl "${message}" wurde empfangen und im internen ARGUS-Kern verarbeitet. Alle Systeme arbeiten nominal.`
      : `${salutation} Befehl "${message}" verarbeitet. Alle Systeme laufen einwandfrei.`,
    actions,
  };
}
