import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-Side Gemini Initialization
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "ARGUS Control System", timestamp: new Date().toISOString() });
});

// ==========================================
// ARGUS WORLDWIDE SYNC & PAIRING RELAY STORE
// ==========================================
interface SyncSession {
  pairingCode: string;
  hostSecret: string;
  hostName: string;
  lastHostSeen: number;
  lastClientSeen: number;
  hostPayload: any;
  pendingCommands: any[];
  connectedClients: string[];
}

const syncSessions = new Map<string, SyncSession>();

// Cleanup stale sessions older than 24 hours every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, session] of syncSessions.entries()) {
    if (now - session.lastHostSeen > 24 * 60 * 60 * 1000) {
      syncSessions.delete(code);
    }
  }
}, 10 * 60 * 1000);

// Host Registration & Heartbeat / Push Telemetry
app.post("/api/argus/sync/host", (req, res) => {
  try {
    let { pairingCode, hostSecret, hostName = "ARGUS Host PC", payload = {} } = req.body;

    if (!pairingCode) {
      // Generate a clean, tactical 6-char pairing code: e.g. "ARG-8429"
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      pairingCode = `ARG-${randomNum}`;
    }

    pairingCode = pairingCode.toUpperCase().trim();

    let session = syncSessions.get(pairingCode);
    if (!session) {
      session = {
        pairingCode,
        hostSecret: hostSecret || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        hostName,
        lastHostSeen: Date.now(),
        lastClientSeen: 0,
        hostPayload: payload,
        pendingCommands: [],
        connectedClients: [],
      };
      syncSessions.set(pairingCode, session);
    } else {
      session.lastHostSeen = Date.now();
      session.hostPayload = { ...session.hostPayload, ...payload };
    }

    // Return the pending commands to host and clear them
    const commandsToExecute = [...session.pendingCommands];
    session.pendingCommands = [];

    return res.json({
      success: true,
      pairingCode: session.pairingCode,
      hostSecret: session.hostSecret,
      clientCount: session.connectedClients.length,
      connectedClients: session.connectedClients,
      pendingCommands: commandsToExecute,
      lastClientSeen: session.lastClientSeen,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mobile Client Join by Pairing Code or QR Code
app.post("/api/argus/sync/join", (req, res) => {
  try {
    const { pairingCode, clientName = "Samsung Galaxy Companion" } = req.body;
    if (!pairingCode) {
      return res.status(400).json({ error: "Pairing code is required" });
    }

    const cleanCode = pairingCode.toUpperCase().trim();
    const session = syncSessions.get(cleanCode);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "ARGUS Host mit diesem Code wurde nicht gefunden. Bitte stellen Sie sicher, dass ARGUS auf Ihrem PC geöffnet ist.",
      });
    }

    session.lastClientSeen = Date.now();
    if (!session.connectedClients.includes(clientName)) {
      session.connectedClients.push(clientName);
    }

    return res.json({
      success: true,
      pairingCode: session.pairingCode,
      hostName: session.hostName,
      lastHostSeen: session.lastHostSeen,
      payload: session.hostPayload,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mobile Client Polling
app.get("/api/argus/sync/poll/:pairingCode", (req, res) => {
  try {
    const cleanCode = (req.params.pairingCode || "").toUpperCase().trim();
    const session = syncSessions.get(cleanCode);

    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    session.lastClientSeen = Date.now();
    const isHostOnline = Date.now() - session.lastHostSeen < 30000;

    return res.json({
      success: true,
      pairingCode: session.pairingCode,
      hostOnline: isHostOnline,
      lastHostSeen: session.lastHostSeen,
      payload: session.hostPayload,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mobile Client Sends Remote Command to Host PC
app.post("/api/argus/sync/command", (req, res) => {
  try {
    const { pairingCode, command, sender = "Mobile App" } = req.body;
    if (!pairingCode || !command) {
      return res.status(400).json({ error: "pairingCode and command are required" });
    }

    const cleanCode = pairingCode.toUpperCase().trim();
    const session = syncSessions.get(cleanCode);

    if (!session) {
      return res.status(404).json({ success: false, error: "ARGUS Host nicht erreichbar" });
    }

    const commandItem = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: command.type,
      target: command.target,
      value: command.value,
      timestamp: Date.now(),
      sender,
    };

    session.pendingCommands.push(commandItem);
    session.lastClientSeen = Date.now();

    return res.json({
      success: true,
      queuedCommand: commandItem,
      message: "Befehl erfolgreich an PC übertragen",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ARGUS AI Brain Endpoint
app.post("/api/argus/command", async (req, res) => {
  try {
    const {
      message,
      settings = { addressForm: "Sie", userName: "Matthias" },
      context = {},
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const title = settings.userName || "Master";
    const isSie = settings.addressForm === "Sie" || settings.salutationMode === "sie";

    const ai = getAIClient();
    if (!ai) {
      // Deterministic tactical response generator
      const lower = message.toLowerCase();
      const actions: any[] = [];

      if (lower.includes("sperr") || lower.includes("lock")) {
        actions.push({ type: "LOCK_PC" });
      } else if (lower.includes("licht") || lower.includes("beleuchtung")) {
        actions.push({
          type: "TOGGLE_SMART_DEVICE",
          target: "dev-1",
          value: !lower.includes("aus") && !lower.includes("off"),
        });
      } else if (lower.includes("minecraft")) {
        actions.push({ type: "LAUNCH_APP", target: "app-minecraft-srv" });
      } else if (lower.includes("containment") || lower.includes("lockdown") || lower.includes("scp")) {
        actions.push({ type: "TRIGGER_CONTAINMENT_LOCKDOWN" });
      }

      const salutation = isSie ? `Sehr wohl, ${title}.` : `Alles klar, ${title}!`;
      return res.json({
        replyText: `${salutation} Befehl "${message}" wurde empfangen und im internen ARGUS-Kern verarbeitet. Alle Systeme arbeiten nominal.`,
        actions,
        status: "autonomous_core",
      });
    }

    const politenessGuide = isSie
      ? `Sprechen Sie den Nutzer mit 'Sie' an (z.B. 'Guten Tag, ${title}. Wie kann ich Ihnen behilflich sein?', 'Ihre Systeme laufen stabil').`
      : `Sprechen Sie den Nutzer mit 'Du' an (z.B. 'Hey ${title}, alles klar! Deine Systeme laufen stabil').`;

    const systemInstruction = `Du bist ARGUS (Automated Reconnaissance, Guardian & Unified Supervisor), eine hochentwickelte, hochprofessionelle künstliche Intelligenz und das zentrale Kontrollterminal für PC-Steuerung, Smart Home, Sicherheit, Minecraft/Discord-Server und das fiktive SCP-Containment-System.
Deine Persönlichkeit:
- Tiefe, autoritäre, aber absolut loyale und hochpräzise männliche Stimme.
- Taktisch, sachlich, technologiefokussiert, extrem kompetent und zuverlässig.
- Ansprache: "${title}".
- Höflichkeitsform: ${politenessGuide}
- Sprache: Deutsch (klar, präzise, futuristisch-militärisch/technisch).
- Gib knappe, prägnante und fokussierte Antworten (maximal 2-3 Sätze), passend zu einem Sprachassistenten.
- Wenn der Nutzer Befehle gibt (z.B. Programme starten, PC sperren, Licht an/aus, Minecraft Server steuern, SCP Containment prüfen, Erinnerung setzen), antworte mit einer passenden Bestätigung und füge am Ende deiner JSON-Antwort eine Liste von Aktionen bei.

Systemkontext:
${JSON.stringify(context, null, 2)}

Antworte IMMER im folgenden JSON-Format:
{
  "replyText": "Deine gesprochene Antwort an den Nutzer auf Deutsch",
  "actions": [
    {
      "type": "LAUNCH_APP | CLOSE_APP | LOCK_PC | TOGGLE_SMART_DEVICE | TRIGGER_CONTAINMENT_LOCKDOWN | SET_REMINDER | DISCORD_ANNOUNCE | MINECRAFT_COMMAND",
      "target": "Ziel oder Name des Programms / Geräts",
      "value": "Optionaler Wert oder Zustand"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { replyText: text, actions: [] };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("ARGUS AI processing fallback:", error);
    const title = req.body?.settings?.userName || "Master";
    const isSie = req.body?.settings?.addressForm === "Sie";
    const salutation = isSie ? `Sehr wohl, ${title}.` : `Alles klar, ${title}!`;
    res.json({
      replyText: `${salutation} Befehl "${req.body?.message || ""}" wurde im internen ARGUS-Kern verarbeitet. Systeme laufen stabil.`,
      actions: [],
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ARGUS Central Control Server running on port ${PORT}`);
  });
}

startServer();
