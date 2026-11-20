"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Mic,
  MicOff,
  Monitor,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Video,
  Volume2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Primitives";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { useConfirmInterviewCode, useRequestInterviewCode } from "@/hooks/useInterviewSession";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PublicInterviewInfo } from "@/lib/types";
import { AudioWaveVisualizer } from "./AudioWaveVisualizer";

export interface InterviewProctor {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: string;
  micStatus: string;
  micLevel: number;
  faceCount: number | null;
  faceDetectorAvailable: boolean;
  inFullscreen: boolean;
  tracking: boolean;
  start: () => Promise<boolean>;
  stop: () => void;
  takeSnapshot: (maxWidth?: number) => string | null;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  getTelemetry: () => {
    sampledFrames: number;
    facePresentRatio: number;
    multipleFaceSamples: number;
    deviceSamples: number;
    noiseSamples: number;
    poorLightingSamples: number;
    micLevelAverage: number;
  };
  resetTelemetry: () => void;
  getStream: () => MediaStream | null;
  getAnalyser?: () => AnalyserNode | null;
}

interface Props {
  info: PublicInterviewInfo;
  proctor: InterviewProctor;
  starting: boolean;
  onStart: (identity: { candidateName?: string; candidateEmail?: string }) => void;
}

/**
 * Requirement 4: opening the link triggers the camera + microphone permission
 * prompt, and requirement 9's full-screen/proctoring rules are consented to
 * before the first question is served.
 *
 * Enhanced with interactive sound check, face framing guide, and system readiness diagnostics.
 */
export function InterviewPreflight({ info, proctor, starting, onStart }: Props) {
  const [name, setName] = useState(info.session?.candidateName ?? "");
  const [email, setEmail] = useState(info.session?.candidateEmail ?? "");
  const [consent, setConsent] = useState(false);
  const [requested, setRequested] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showFramingGuide, setShowFramingGuide] = useState(true);

  // Mic Soundcheck State
  const [soundCheckState, setSoundCheckState] = useState<"idle" | "recording" | "ready" | "playing">("idle");
  const [soundCheckCountdown, setSoundCheckCountdown] = useState(3);
  const [soundCheckAudioUrl, setSoundCheckAudioUrl] = useState<string | null>(null);
  const soundCheckRecorderRef = useRef<MediaRecorder | null>(null);
  const soundCheckAudioRef = useRef<HTMLAudioElement | null>(null);

  /** Link security: prove you own the address the invitation was sent to. */
  const token = info.session?.token ?? "";
  const requestCode = useRequestInterviewCode(token);
  const confirmCode = useConfirmInterviewCode(token);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(Boolean(info.session?.emailVerifiedAt));
  const [devCode, setDevCode] = useState<string | undefined>(undefined);

  const needsEmailVerification = Boolean(info.requiresEmailVerification);

  const cameraReady = proctor.cameraStatus === "ready";
  const micReady = proctor.micStatus === "ready";
  const devicesReady = cameraReady && micReady;

  const speechRecognitionSupported =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    );

  useEffect(() => {
    // Ask for the camera/microphone as soon as the page opens (requirement 4).
    if (!requested) {
      setRequested(true);
      void proctor.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Personal links: send the one-time code automatically so the candidate can
    // prove ownership of the invited mailbox before starting (requirement 5).
    if (needsEmailVerification && token && !codeSent && !requestCode.isPending) {
      requestCode.mutate(undefined, {
        onSuccess: (result) => {
          setCodeSent(true);
          setDevCode(result.devCode);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsEmailVerification, token]);

  const verifying = requestCode.isPending || confirmCode.isPending;

  const handleVerify = () => {
    if (code.trim().length !== 6) return;
    confirmCode.mutate(code.trim());
  };

  const canSubmit = useMemo(() => {
    if (!devicesReady || !consent || starting) return false;
    if (needsEmailVerification) return false;
    if (!info.requiresIdentity) return true;
    return Boolean(name.trim() && email.trim());
  }, [devicesReady, consent, starting, info.requiresIdentity, name, email, needsEmailVerification]);

  const requestDevices = async () => {
    setLocalError(null);
    const ok = await proctor.start();
    if (!ok) {
      setLocalError(
        "Camera and microphone access was blocked. Allow them in your browser's address bar, then try again.",
      );
    }
  };

  // 3-second quick audio sound check
  const startSoundCheck = () => {
    const stream = proctor.getStream();
    if (!stream || typeof MediaRecorder === "undefined") return;

    try {
      const audioStream = new MediaStream(stream.getAudioTracks());
      const recorder = new MediaRecorder(audioStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setSoundCheckAudioUrl(url);
        setSoundCheckState("ready");
      };

      recorder.start();
      soundCheckRecorderRef.current = recorder;
      setSoundCheckState("recording");
      setSoundCheckCountdown(3);

      let remaining = 3;
      const timer = setInterval(() => {
        remaining -= 1;
        setSoundCheckCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          try {
            recorder.stop();
          } catch {
            /* noop */
          }
        }
      }, 1000);
    } catch {
      setSoundCheckState("idle");
    }
  };

  const playSoundCheck = () => {
    if (!soundCheckAudioUrl) return;
    if (!soundCheckAudioRef.current) {
      soundCheckAudioRef.current = new Audio(soundCheckAudioUrl);
      soundCheckAudioRef.current.onended = () => setSoundCheckState("ready");
    }
    setSoundCheckState("playing");
    soundCheckAudioRef.current.currentTime = 0;
    void soundCheckAudioRef.current.play().catch(() => setSoundCheckState("ready"));
  };

  const handleStart = async () => {
    if (!canSubmit) return;
    await proctor.requestFullscreen();
    onStart({
      candidateName: info.requiresIdentity ? name.trim() : undefined,
      candidateEmail: info.requiresIdentity ? email.trim() : undefined,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card>
        <CardHeader
          icon={<Video className="size-4 text-primary-600" />}
          title={info.interview.title}
          subtitle={
            <>
              {info.interview.company?.name ? `${info.interview.company.name} · ` : ""}
              {info.interview.technology.toUpperCase()} · {info.questionTotal} questions ·{" "}
              {Math.round(info.interview.questionTimeSeconds / 60)} min each
            </>
          }
          action={
            <Badge tone={proctor.inFullscreen ? "green" : "amber"}>
              <ShieldAlert className="size-3" />
              {info.policy.proctoringEnabled ? "AI Proctored" : "Standard"}
            </Badge>
          }
        />
        <CardBody className="space-y-6">
          {info.interview.description && (
            <p className="text-sm text-muted-foreground">{info.interview.description}</p>
          )}

          {/* Camera preview and device diagnostics */}
          <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr]">
            {/* Live camera preview with toggleable framing guide */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-slate-950 shadow-inner">
              <video
                ref={proctor.videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-video w-full object-cover"
              />

              {/* Face framing guide overlay */}
              {showFramingGuide && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative h-44 w-36 rounded-[50%] border-2 border-dashed border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-sky-400/30" />
                  </div>
                  <span className="mt-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-sky-200 backdrop-blur-sm">
                    Keep your face centered & upright
                  </span>
                </div>
              )}

              {/* Status bar */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/75 px-3 py-2 text-[11px] text-white backdrop-blur-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <span
                    className={cn(
                      "size-2 rounded-full ring-2 ring-white/20",
                      cameraReady ? "bg-emerald-400" : "bg-rose-400 animate-pulse",
                    )}
                  />
                  Camera {cameraReady ? "Connected" : "Not connected"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFramingGuide((prev) => !prev)}
                  className="rounded px-1.5 py-0.5 text-[10px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {showFramingGuide ? "Hide Framing Guide" : "Show Framing Guide"}
                </button>
              </div>
            </div>

            {/* Device diagnostics & soundcheck */}
            <div className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {cameraReady ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <CameraOff className="size-4 text-rose-500" />
                    )}
                    Video Stream
                  </span>
                  <Badge tone={cameraReady ? "green" : "red"} size="sm">
                    {cameraReady ? "Ready" : "Blocked"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {micReady ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <MicOff className="size-4 text-rose-500" />
                    )}
                    Microphone
                  </span>
                  <Badge tone={micReady ? "green" : "red"} size="sm">
                    {micReady ? "Ready" : "Blocked"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserCheck className="size-3.5" />
                    AI Face Proctoring
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {proctor.faceDetectorAvailable ? "Hardware API" : "Vision Heuristic"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    Live Speech AI
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {speechRecognitionSupported ? "Supported" : "Telemetry Only"}
                  </span>
                </div>

                {/* Audio Wave Visualizer */}
                <div className="pt-1">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Voice Activity</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {Math.round(proctor.micLevel * 100)}%
                    </span>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-900/60 p-1.5 dark:bg-slate-950">
                    <AudioWaveVisualizer
                      analyser={proctor.getAnalyser ? proctor.getAnalyser() : null}
                      micLevel={proctor.micLevel}
                      isActive={micReady}
                      height={28}
                      barCount={24}
                    />
                  </div>
                </div>
              </div>

              {/* Mic Soundcheck action */}
              <div className="space-y-2 pt-2 border-t border-border">
                {soundCheckState === "idle" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={startSoundCheck}
                    disabled={!micReady}
                  >
                    <Mic className="size-3.5 text-primary-600" />
                    Record 3s Mic Sound Check
                  </Button>
                )}

                {soundCheckState === "recording" && (
                  <div className="flex items-center justify-between rounded-md bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="size-2 animate-ping rounded-full bg-rose-500" />
                      Say something...
                    </span>
                    <span className="font-mono font-bold">{soundCheckCountdown}s</span>
                  </div>
                )}

                {(soundCheckState === "ready" || soundCheckState === "playing") && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={playSoundCheck}
                      disabled={soundCheckState === "playing"}
                    >
                      {soundCheckState === "playing" ? (
                        <>
                          <Volume2 className="size-3.5 animate-pulse text-primary-600" />
                          Playing back...
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5 text-emerald-600" />
                          Hear Mic Playback
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-xs"
                      onClick={startSoundCheck}
                      title="Re-test mic"
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[11px] text-muted-foreground"
                  onClick={requestDevices}
                  disabled={proctor.cameraStatus === "requesting"}
                >
                  {devicesReady ? "Re-detect devices" : "Request camera & microphone permissions"}
                </Button>
              </div>
            </div>
          </div>

          {localError && (
            <Alert variant="destructive">
              <AlertTitle>Device access required</AlertTitle>
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          {/* Proctoring guidelines */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
              Proctoring & Anti-Cheating Protocol
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
              {info.policy.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Candidate Identity */}
          {info.requiresIdentity && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="candidate-name">Full name</Label>
                <Input
                  id="candidate-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="candidate-email">Email address</Label>
                <Input
                  id="candidate-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="alex@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {/* Email Verification */}
          {needsEmailVerification && (
            <div className="space-y-3 rounded-xl border border-primary-200 bg-primary-50/70 p-4 text-sm dark:border-primary-800/80 dark:bg-primary-950/40">
              <p className="font-semibold text-primary-900 dark:text-primary-100">
                Identity Security Verification
              </p>
              <p className="text-xs text-primary-900/80 dark:text-primary-100/90">
                This exclusive link was issued to{" "}
                <span className="font-semibold underline">
                  {info.invitedEmail ?? info.session?.candidateEmail}
                </span>
                . Enter the 6-digit verification code sent to your inbox to unlock this session.
              </p>

              {devCode && (
                <p className="rounded-md bg-amber-100/80 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                  Dev bypass code: <strong className="font-mono tracking-wider">{devCode}</strong>
                </p>
              )}

              <div className="flex flex-wrap items-end gap-2">
                <div className="w-44">
                  <Label htmlFor="verify-code">6-digit code</Label>
                  <Input
                    id="verify-code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="font-mono tracking-[0.4em]"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleVerify();
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleVerify}
                  disabled={code.length !== 6 || verifying}
                  loading={verifying}
                >
                  Verify email
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => requestCode.mutate()}
                  disabled={requestCode.isPending}
                >
                  {codeSent ? "Resend code" : "Send code"}
                </Button>
              </div>

              {confirmCode.isError && (
                <p className="text-xs font-medium text-destructive">
                  {getErrorMessage(confirmCode.error)}
                </p>
              )}
            </div>
          )}

          {/* Consent Checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-foreground hover:bg-muted/30 transition-colors">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-border accent-primary-600 focus:ring-primary-500"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              I understand and consent to being recorded via webcam and microphone during this
              technical evaluation. I agree to remain in fullscreen mode and adhere strictly to the
              anti-cheating guidelines. Multiple faces, external electronic devices, tab switches,
              or absence will immediately terminate the session with a score of 0.
            </span>
          </label>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{info.questionTotal} questions</span> ·{" "}
              {Math.round(info.interview.questionTimeSeconds / 60)} min per question · Hints available
            </div>
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!canSubmit}
              loading={starting}
              className="min-w-[200px] shadow-sm"
            >
              Start AI Interview
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
