// Voice chat signaling: lets browsers in the same voice channel find each other and
// set up direct WebRTC audio connections. The audio itself never passes through here.
import type { IncomingMessage } from "http";
import crypto from "crypto";
import { WebSocket } from "ws";
import { sessionMiddleware } from "./auth";
import { storage } from "./storage";

// channelId -> (userId -> socket)
const rooms = new Map<string, Map<string, WebSocket>>();

function send(ws: WebSocket, type: string, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, data }));
}

/** Reads the logged-in user id from the session cookie on the WebSocket upgrade request. */
function sessionUserId(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve) => {
    if (!sessionMiddleware) return resolve(null);
    try {
      sessionMiddleware(req as any, {} as any, () => {
        resolve((req as any).session?.passport?.user ?? null);
      });
    } catch {
      resolve(null);
    }
  });
}

/** ICE servers for the browser: public STUN, plus our own TURN relay when configured. */
export function iceServersFor(userId: string) {
  const servers: Array<{ urls: string[]; username?: string; credential?: string }> = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];
  const secret = process.env.TURN_SECRET;
  const host = process.env.TURN_HOST;
  if (secret && host) {
    // coturn "use-auth-secret" credentials, valid for 12 hours
    const username = `${Math.floor(Date.now() / 1000) + 12 * 3600}:${userId}`;
    const credential = crypto.createHmac("sha1", secret).update(username).digest("base64");
    servers.push({
      urls: [`turn:${host}:3478?transport=udp`, `turn:${host}:3478?transport=tcp`],
      username,
      credential,
    });
  }
  return servers;
}

export async function attachVoice(
  ws: WebSocket,
  req: IncomingMessage,
  broadcast: (type: string, data: unknown) => void,
) {
  const userId = await sessionUserId(req);
  let currentChannel: string | null = null;

  const leaveRoom = async (cleanupDb: boolean) => {
    const channelId = currentChannel;
    if (!channelId || !userId) return;
    currentChannel = null;
    const room = rooms.get(channelId);
    if (!room || room.get(userId) !== ws) return; // replaced by a newer tab
    room.delete(userId);
    if (room.size === 0) rooms.delete(channelId);
    room.forEach((peer) => send(peer, "voice:peer-left", { channelId, userId }));
    if (cleanupDb) {
      try {
        await storage.leaveVoiceChannel(channelId, userId);
        const participants = await storage.getChannelParticipants(channelId);
        broadcast("voice-channel-update", { channelId, participants });
      } catch (e) {
        console.error("Voice cleanup failed:", e);
      }
    }
  };

  ws.on("message", async (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!msg || typeof msg.type !== "string" || !msg.type.startsWith("voice:")) return;
    if (!userId) return send(ws, "voice:error", { message: "Sign in to use voice channels" });

    switch (msg.type) {
      case "voice:ping":
        return send(ws, "voice:pong", {});

      case "voice:join": {
        const channelId = String(msg.channelId || "");
        const channel = await storage.getVoiceChannel(channelId);
        if (!channel || !channel.isActive) return send(ws, "voice:error", { message: "Channel not available" });
        if (currentChannel && currentChannel !== channelId) await leaveRoom(false);

        const room = rooms.get(channelId) ?? new Map<string, WebSocket>();
        const previous = room.get(userId);
        if (previous && previous !== ws) send(previous, "voice:kicked", { reason: "Joined from another tab" });
        const peers = Array.from(room.keys()).filter((id) => id !== userId);
        room.set(userId, ws);
        rooms.set(channelId, room);
        currentChannel = channelId;
        // The newcomer calls everyone already in the room
        return send(ws, "voice:peers", { channelId, peers });
      }

      case "voice:signal": {
        if (!currentChannel) return;
        const target = rooms.get(currentChannel)?.get(String(msg.to));
        if (!target) return;
        return send(target, "voice:signal", {
          from: userId,
          description: msg.description ?? null,
          candidate: msg.candidate ?? null,
        });
      }

      case "voice:leave":
        return leaveRoom(false);
    }
  });

  ws.on("close", () => {
    void leaveRoom(true);
  });
}
