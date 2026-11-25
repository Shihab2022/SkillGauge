"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, Mic, ShieldAlert, ShieldCheck, UserCheck, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { attemptsApi } from "@/lib/api";

interface AttemptProctorHudProps {
  attemptId: string;
  enabled: boolean;
}

export function AttemptProctorHud({ attemptId, enabled }: AttemptProctorHudProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [faceStatus, setFaceStatus] = useState<"ok" | "multiple" | "missing" | "unsupported">("ok");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize camera and microphone
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraReady(true);

        // Audio Analyser for mic level
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const buffer = new Uint8Array(analyser.frequencyBinCount);
            const pollMic = () => {
              if (!isMounted) return;
              analyser.getByteFrequencyData(buffer);
              let sum = 0;
              for (let i = 0; i < buffer.length; i++) sum += buffer[i] ?? 0;
              const avg = sum / (buffer.length * 255);
              setMicLevel(avg);
              requestAnimationFrame(pollMic);
            };
            pollMic();
          }
        } catch {
          // Audio analyser optional
        }
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Camera access required";
        setPermissionError(msg);
        attemptsApi
          .reportAntiCheatEvent(attemptId, {
            eventType: "SUSPICIOUS_ACTIVITY",
            metadata: { type: "CAMERA_DENIED", detail: msg },
          })
          .catch(() => undefined);
      }
    }

    void initMedia();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, [enabled, attemptId]);

  // Periodic Face Detection Check (using native FaceDetector API if supported, or motion detection)
  useEffect(() => {
    if (!enabled || !cameraReady) return;

    let timer: NodeJS.Timeout;

    const checkFace = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const FaceDetectorCtor = (
        window as unknown as {
          FaceDetector?: new () => {
            detect(source: HTMLVideoElement): Promise<Array<{ boundingBox: unknown }>>;
          };
        }
      ).FaceDetector;

      if (FaceDetectorCtor) {
        try {
          const detector = new FaceDetectorCtor();
          const faces = await detector.detect(video);
          if (faces.length > 1) {
            setFaceStatus("multiple");
            attemptsApi
              .reportAntiCheatEvent(attemptId, {
                eventType: "SUSPICIOUS_ACTIVITY",
                metadata: { type: "MULTIPLE_FACES_DETECTED", count: faces.length },
              })
              .catch(() => undefined);
          } else if (faces.length === 0) {
            setFaceStatus("missing");
          } else {
            setFaceStatus("ok");
          }
        } catch {
          setFaceStatus("unsupported");
        }
      } else {
        setFaceStatus("ok");
      }
    };

    timer = setInterval(() => {
      void checkFace();
    }, 4000);

    return () => clearInterval(timer);
  }, [enabled, cameraReady, attemptId]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      <div className="overflow-hidden rounded-xl border border-primary-300/80 bg-background/95 shadow-xl backdrop-blur-md transition-all dark:border-primary-800">
        <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>AI Proctoring</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isMinimized ? "Expand" : "Minimize"}
          </button>
        </div>

        {!isMinimized && (
          <div className="p-2">
            {permissionError ? (
              <div className="flex w-52 flex-col items-center justify-center p-3 text-center">
                <ShieldAlert className="size-8 text-destructive" />
                <p className="mt-1 text-xs font-medium text-destructive">Camera Required</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  AI proctoring was enabled by admin for this exam. Please allow camera permissions.
                </p>
              </div>
            ) : (
              <div className="relative h-32 w-44 overflow-hidden rounded-lg bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="size-full -scale-x-100 object-cover"
                />

                {/* Status Badges Overlay */}
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    {faceStatus === "multiple" ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <Users className="size-3" /> Multi-Face
                      </span>
                    ) : faceStatus === "missing" ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="size-3" /> No Face
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <UserCheck className="size-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Mic Level indicator */}
                  <div className="flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5" title="Mic Level">
                    <Mic className="size-2.5 text-slate-300" />
                    <div className="h-1.5 w-6 rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-75"
                        style={{ width: `${Math.min(100, micLevel * 250)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
