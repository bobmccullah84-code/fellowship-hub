import { useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "connecting" | "connected" | "error";

interface Options {
  /** Channel to be connected to, or null to disconnect. */
  channelId: string | null;
  /** Current user id (needed to show the local speaking indicator). */
  userId: string | undefined;
  /** Whether the local microphone should be silenced (self-mute or moderator mute). */
  muted: boolean;
  /** Called when the connection drops or the server ends it. */
  onDisconnected?: (reason: string) => void;
}

/**
 * Real voice chat for one channel: captures the microphone and connects directly
 * (WebRTC, one connection per person) to everyone else in the channel. The site's
 * WebSocket is only used to introduce the browsers to each other.
 */
export function useVoiceRoom({ channelId, userId, muted, onDisconnected }: Options) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [micAvailable, setMicAvailable] = useState(true);
  const [speaking, setSpeaking] = useState<Set<string>>(new Set());
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

  const localStream = useRef<MediaStream | null>(null);
  const mutedRef = useRef(muted);
  const onDisconnectedRef = useRef(onDisconnected);
  onDisconnectedRef.current = onDisconnected;

  // Apply mute changes to the live microphone track
  useEffect(() => {
    mutedRef.current = muted;
    localStream.current?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }, [muted]);

  useEffect(() => {
    if (!channelId) {
      setStatus("idle");
      setSpeaking(new Set());
      setConnectedPeers([]);
      return;
    }

    let closed = false;
    const peers = new Map<string, RTCPeerConnection>();
    const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
    const audios = new Map<string, HTMLAudioElement>();
    const analysers = new Map<string, AnalyserNode>(); // local microphone level
    let audioCtx: AudioContext | null = null;
    let ws: WebSocket | null = null;
    let iceServers: RTCIceServer[] = [];
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let speakTimer: ReturnType<typeof setInterval> | undefined;

    setStatus("connecting");

    const refreshPeers = () =>
      setConnectedPeers(
        Array.from(peers.entries())
          .filter(([, pc]) => pc.connectionState === "connected")
          .map(([id]) => id),
      );

    const watchLevel = (id: string, stream: MediaStream) => {
      try {
        audioCtx ??= new AudioContext();
        void audioCtx.resume();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analysers.set(id, analyser);
      } catch {
        /* speaking indicator is optional */
      }
    };

    const signal = (to: string, payload: { description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "voice:signal", to, ...payload }));
    };

    const removePeer = (id: string) => {
      peers.get(id)?.close();
      peers.delete(id);
      pendingCandidates.delete(id);
      const audio = audios.get(id);
      if (audio) {
        audio.pause();
        audio.srcObject = null;
      }
      audios.delete(id);
      analysers.delete(id);
      refreshPeers();
    };

    const createPeer = (id: string) => {
      const pc = new RTCPeerConnection({ iceServers });
      peers.set(id, pc);
      const stream = localStream.current;
      if (stream) {
        stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
      }
      pc.onicecandidate = (e) => {
        if (e.candidate) signal(id, { candidate: e.candidate.toJSON() });
      };
      pc.ontrack = (e) => {
        const remote = e.streams[0] ?? new MediaStream([e.track]);
        let audio = audios.get(id);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          audios.set(id, audio);
        }
        audio.srcObject = remote;
        void audio.play().catch(() => {});
      };
      pc.onconnectionstatechange = () => {
        refreshPeers();
        if (pc.connectionState === "failed") pc.restartIce();
      };
      return pc;
    };

    const flushCandidates = async (id: string, pc: RTCPeerConnection) => {
      const queued = pendingCandidates.get(id) ?? [];
      pendingCandidates.delete(id);
      for (const c of queued) await pc.addIceCandidate(c).catch(() => {});
    };

    // Newcomer: call everyone already in the room
    const callPeer = async (id: string) => {
      const pc = createPeer(id);
      if (!localStream.current) pc.addTransceiver("audio", { direction: "recvonly" });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signal(id, { description: pc.localDescription!.toJSON() });
    };

    const onSignal = async (from: string, description: RTCSessionDescriptionInit | null, candidate: RTCIceCandidateInit | null) => {
      let pc = peers.get(from);
      if (description) {
        if (description.type === "offer") {
          if (pc && pc.signalingState !== "stable") return; // ignore glare; newcomer always offers
          pc ??= createPeer(from);
          await pc.setRemoteDescription(description);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signal(from, { description: pc.localDescription!.toJSON() });
          await flushCandidates(from, pc);
        } else if (pc) {
          await pc.setRemoteDescription(description);
          await flushCandidates(from, pc);
        }
      } else if (candidate) {
        if (pc?.remoteDescription) await pc.addIceCandidate(candidate).catch(() => {});
        else pendingCandidates.set(from, [...(pendingCandidates.get(from) ?? []), candidate]);
      }
    };

    const start = async () => {
      try {
        const res = await fetch("/api/voice/ice-servers", { credentials: "include" });
        if (res.ok) iceServers = (await res.json()).iceServers;
      } catch {
        /* fall back to no ICE servers (same-network only) */
      }

      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
        localStream.current.getAudioTracks().forEach((t) => (t.enabled = !mutedRef.current));
        if (userId) watchLevel(userId, localStream.current);
        setMicAvailable(true);
      } catch {
        localStream.current = null; // listen-only
        setMicAvailable(false);
      }
      if (closed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      ws.onopen = () => {
        ws!.send(JSON.stringify({ type: "voice:join", channelId }));
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "voice:ping" }));
        }, 25000);
      };
      ws.onmessage = async (event) => {
        let msg: any;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        try {
          switch (msg.type) {
            case "voice:peers":
              setStatus("connected");
              for (const id of msg.data.peers as string[]) await callPeer(id);
              break;
            case "voice:signal":
              await onSignal(msg.data.from, msg.data.description, msg.data.candidate);
              break;
            case "voice:peer-left":
              removePeer(msg.data.userId);
              break;
            case "voice:kicked":
              closed = true;
              onDisconnectedRef.current?.(msg.data?.reason || "Disconnected");
              break;
            case "voice:error":
              setStatus("error");
              onDisconnectedRef.current?.(msg.data?.message || "Voice error");
              break;
          }
        } catch (e) {
          console.error("Voice signaling error", e);
        }
      };
      ws.onclose = () => {
        if (!closed) {
          setStatus("error");
          onDisconnectedRef.current?.("Lost connection to the voice server");
        }
      };

      // Speaking indicator
      const buf = new Uint8Array(256);
      speakTimer = setInterval(() => {
        const now = new Set<string>();
        analysers.forEach((analyser, id) => {
          if (id === userId && mutedRef.current) return;
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          if (Math.sqrt(sum / buf.length) > 0.04) now.add(id);
        });
        // Remote voices: WebRTC reports each incoming stream's audio level directly
        peers.forEach((pc, id) => {
          for (const receiver of pc.getReceivers()) {
            if (receiver.track.kind !== "audio") continue;
            const level = receiver.getSynchronizationSources?.()[0]?.audioLevel ?? 0;
            if (level > 0.02) now.add(id);
          }
        });
        setSpeaking((prev) =>
          prev.size === now.size && Array.from(now).every((id) => prev.has(id)) ? prev : now,
        );
      }, 150);
    };

    void start();

    return () => {
      closed = true;
      clearInterval(pingTimer);
      clearInterval(speakTimer);
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "voice:leave" }));
        ws.close();
      }
      Array.from(peers.keys()).forEach(removePeer);
      localStream.current?.getTracks().forEach((t) => t.stop());
      localStream.current = null;
      void audioCtx?.close();
      setSpeaking(new Set());
      setConnectedPeers([]);
    };
  }, [channelId, userId]);

  return { status, micAvailable, speaking, connectedPeers };
}
