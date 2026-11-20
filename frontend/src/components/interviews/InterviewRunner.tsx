"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Lightbulb,
  Mic,
  PenLine,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Progress } from "@/components/ui/Primitives";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getErrorStatus, interviewSessionApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  ReportViolationPayload,
  StartSessionResult,
  SubmitAnswerPayload,
} from "@/lib/types";
import type { InterviewProctor } from "./InterviewPreflight";
import { AudioWaveVisualizer } from "./AudioWaveVisualizer";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface Props {
  token: string;
  start: StartSessionResult;
  proctor: InterviewProctor;
  /** Fire-and-forget proctoring report; the parent handles termination. */
  onViolation: (payload: ReportViolationPayload) => void;
  onComplete: (reason: "CANDIDATE_SUBMIT" | "TIME_EXPIRED" | "PROCTORING") => void;
}

/** Evidence frames captured per question: start, middle and end. */
const SNAPSHOTS_PER_QUESTION = 3;

const COMMON_FILLERS = ["um", "uh", "like", "you know", "basically", "sort of", "actually"];

export function InterviewRunner({ token, start, proctor, onViolation, onComplete }: Props) {
  const questions = start.questions;
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(questions[0]?.timeSeconds ?? 300);
  const [revealedHints, setRevealedHints] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);

  // Thinking notes scratchpad per question
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNotes, setShowNotes] = useState(false);

  // Candidate UI toggles
  const [showLiveCaptions, setShowLiveCaptions] = useState(true);
  const [autoReadQuestion, setAutoReadQuestion] = useState(false);

  const question = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const progress = Math.round(((index + 1) / total) * 100);

  const questionStartedAt = useRef<number>(Date.now());
  const snapshots = useRef<string[]>([]);
  const snapshotFlags = useRef({ start: false, middle: false });
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const keepRecognitionAlive = useRef(true);

  const indexRef = useRef(0);
  indexRef.current = index;
  const transcriptRef = useRef("");
  const revealedRef = useRef(0);
  const timeLimit = question?.timeSeconds ?? 300;

  // TTS Voice Engine
  const tts = useSpeechSynthesis();

  /* --------------------------------------------------------- speech capture */

  const startRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => never }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => never }).webkitSpeechRecognition;
    if (!SpeechRecognition) return; // Firefox/Safari: no live transcript (still recorded via telemetry)

    keepRecognitionAlive.current = true;
    const recognition = new SpeechRecognition() as unknown as {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: (event: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
      abort: () => void;
    };
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += `${result[0].transcript} `;
        else interimText += result[0].transcript;
      }
      if (finalText.trim()) {
        transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
        setTranscript(transcriptRef.current);
      }
      setInterim(interimText);
    };
    recognition.onerror = () => undefined;
    recognition.onend = () => {
      if (keepRecognitionAlive.current) {
        try {
          recognition.start();
        } catch {
          /* already running */
        }
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      /* already running */
    }
  }, []);

  const stopRecognition = useCallback(() => {
    keepRecognitionAlive.current = false;
    try {
      recognitionRef.current?.abort();
    } catch {
      /* noop */
    }
    recognitionRef.current = null;
    setInterim("");
  }, []);

  const captureSnapshot = useCallback(() => {
    const frame = proctor.takeSnapshot(480);
    if (frame && snapshots.current.length < SNAPSHOTS_PER_QUESTION && !snapshots.current.includes(frame)) {
      snapshots.current.push(frame);
    }
  }, [proctor]);

  /* -------------------------------------------------- per-question recording */

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const recordingStartedAt = useRef(0);
  const [recordingActive, setRecordingActive] = useState(false);

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

  /** Starts recording the answer on camera+microphone. */
  const startRecording = useCallback(() => {
    const stream = proctor.getStream();
    if (!stream || typeof MediaRecorder === "undefined") return;
    try {
      const mimeType =
        ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((value) =>
          MediaRecorder.isTypeSupported(value),
        ) ?? undefined;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, videoBitsPerSecond: 250_000 } : undefined,
      );
      recordingChunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) recordingChunks.current.push(event.data);
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      recordingStartedAt.current = Date.now();
      setRecordingActive(true);
    } catch {
      recorderRef.current = null;
      setRecordingActive(false);
    }
  }, [proctor]);

  /** Stops the recorder and returns the clip. */
  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return { url: null, mime: null, seconds: 0 };
    const seconds = Math.max(1, Math.round((Date.now() - recordingStartedAt.current) / 1000));
    const mime = recorder.mimeType || null;

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(recordingChunks.current, { type: mime ?? "video/webm" }));
      try {
        recorder.stop();
      } catch {
        resolve(new Blob([], { type: mime ?? "video/webm" }));
      }
    }).catch(() => null as never);

    recorderRef.current = null;
    setRecordingActive(false);
    if (!blob || blob.size === 0) return { url: null, mime, seconds };

    if (blob.size > 4_500_000) return { url: null, mime, seconds };
    try {
      const url = await blobToDataUrl(blob);
      return { url, mime, seconds };
    } catch {
      return { url: null, mime, seconds };
    }
  }, []);

  const advancing = useRef(false);

  /** Uploads the recorded answer for the current question and advances. */
  const finishQuestion = useCallback(
    async (
      status: "SUBMITTED" | "SKIPPED",
      reason: "CANDIDATE_SUBMIT" | "TIME_EXPIRED" | "PROCTORING",
    ) => {
      if (advancing.current) return;
      const currentIndex = indexRef.current;
      const current = questions[currentIndex];
      if (!current) return;
      advancing.current = true;
      setSaving(true);
      tts.stop();
      stopRecognition();
      captureSnapshot();
      const recording = await stopRecording();

      const spent = Math.max(
        1,
        Math.round((Date.now() - questionStartedAt.current) / 1000),
      );
      const payload: SubmitAnswerPayload = {
        transcript: status === "SUBMITTED" ? transcriptRef.current.trim() : "",
        recordingUrl: recording.url ?? undefined,
        recordingMime: recording.mime ?? undefined,
        recordingSeconds: recording.seconds,
        hintsUsed: revealedRef.current,
        hintsRevealed: questions[currentIndex] ? current.hints.slice(0, revealedRef.current) : [],
        timeSpentSeconds: Math.min(spent, current.timeSeconds),
        startedAt: new Date(questionStartedAt.current).toISOString(),
        snapshots: [...snapshots.current],
        videoFrames: proctor.getTelemetry(),
        status,
      };

      try {
        await interviewSessionApi.saveAnswer(token, current.id, payload);
      } catch (error) {
        if (getErrorStatus(error) === 409) {
          setSaving(false);
          onComplete("PROCTORING");
          return;
        }
      } finally {
        proctor.resetTelemetry();
      }

      setSaving(false);
      if (currentIndex < questions.length - 1) {
        setIndex((value) => value + 1);
        return;
      }
      setFinished(true);
      onComplete(reason);
    },
    [captureSnapshot, onComplete, proctor, questions, stopRecognition, stopRecording, token, tts],
  );

  /** Reveals one more hint (reduces marks). */
  const revealHint = () => {
    if (!question || revealedHints >= question.hints.length) return;
    const next = revealedHints + 1;
    setRevealedHints(next);
    revealedRef.current = next;
  };

  /** Copy/paste inside the interview is a recorded proctoring signal. */
  useEffect(() => {
    const inRoot = (event: Event) =>
      Boolean(
        (event.target as HTMLElement | null)?.closest?.("[data-interview-root]"),
      );
    const onCopy = (event: ClipboardEvent) => {
      if (inRoot(event)) onViolation({ type: "COPY", description: "Text copied from the interview page" });
    };
    const onPaste = (event: ClipboardEvent) => {
      if (inRoot(event)) onViolation({ type: "PASTE", description: "Text pasted into the interview page" });
    };
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [onViolation]);

  /* ------------------------------------------- per-question lifecycle + timer */

  useEffect(() => {
    const current = questions[index];
    if (!current) return;
    indexRef.current = index;
    questionStartedAt.current = Date.now();
    snapshots.current = [];
    snapshotFlags.current = { start: false, middle: false };
    transcriptRef.current = "";
    revealedRef.current = 0;
    advancing.current = false;
    setTranscript("");
    setInterim("");
    setRevealedHints(0);
    setRemaining(current.timeSeconds);
    proctor.resetTelemetry();
    captureSnapshot();
    startRecognition();
    startRecording();

    // Auto-read question if candidate enabled it
    if (autoReadQuestion && tts.isSupported) {
      tts.speak(current.prompt);
    }

    const deadline = Date.now() + current.timeSeconds * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);

      const elapsed = current.timeSeconds - left;
      if (elapsed >= Math.round(current.timeSeconds * 0.5) && !snapshotFlags.current.middle) {
        snapshotFlags.current.middle = true;
        captureSnapshot();
      }
      if (left <= 0) {
        clearInterval(timer);
        void finishQuestion("SUBMITTED", "TIME_EXPIRED");
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      tts.stop();
      stopRecognition();
      void stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  /* ----------------------------------------------- real-time speech telemetry */

  const combinedTranscript = useMemo(() => {
    return `${transcript} ${interim}`.trim();
  }, [transcript, interim]);

  const speechStats = useMemo(() => {
    if (!combinedTranscript) {
      return { wordCount: 0, wpm: 0, fillerCount: 0, paceLabel: "Ready to speak" };
    }
    const wordsArr = combinedTranscript.split(/\s+/).filter(Boolean);
    const count = wordsArr.length;
    const elapsedSec = Math.max(1, timeLimit - remaining);
    const calculatedWpm = elapsedSec > 5 ? Math.round((count / (elapsedSec / 60))) : 0;

    const lower = combinedTranscript.toLowerCase();
    const fillers = COMMON_FILLERS.reduce((acc, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lower.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);

    let pace = "Normal pace";
    if (calculatedWpm > 0 && calculatedWpm < 110) pace = "Calm / deliberate";
    else if (calculatedWpm >= 110 && calculatedWpm <= 165) pace = "Optimal pace";
    else if (calculatedWpm > 165) pace = "Fast pace";

    return {
      wordCount: count,
      wpm: calculatedWpm,
      fillerCount: fillers,
      paceLabel: pace,
    };
  }, [combinedTranscript, remaining, timeLimit]);

  if (!question) return null;

  const clock = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  const lowTime = remaining <= 30;
  const criticalTime = remaining <= 15;
  const moreHintsLeft = question.hints.length > 0 && revealedHints < question.hints.length;
  const currentNotes = notes[question.id] ?? "";

  const handleNotesChange = (text: string) => {
    setNotes((prev) => ({ ...prev, [question.id]: text }));
  };

  const handleSTARInsert = () => {
    const starTemplate = `\n[Situation]: \n[Task]: \n[Action]: \n[Result]: `;
    handleNotesChange(currentNotes ? `${currentNotes}\n${starTemplate}` : starTemplate.trim());
  };

  return (
    <div data-interview-root className="space-y-4">
      {/* ---------------------------------------------------- Studio Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <Badge tone="blue" size="md">
            Question {index + 1} of {total}
          </Badge>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{question.topic ? `${question.topic} · ` : ""}</span>
            <span className="capitalize">{question.difficulty.toLowerCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge
            tone={criticalTime ? "red" : lowTime ? "amber" : "gray"}
            size="md"
            className={cn("font-mono text-sm font-semibold tracking-wider", criticalTime && "animate-pulse ring-2 ring-rose-500")}
          >
            <Clock className="size-3.5" />
            {clock}
          </Badge>

          <Badge tone={proctor.inFullscreen ? "green" : "amber"} size="sm" className="hidden md:inline-flex">
            <ShieldCheck className="size-3.5" />
            {proctor.inFullscreen ? "Full Screen Guard Active" : "Full Screen Off"}
          </Badge>
        </div>
      </div>

      {/* ---------------------------------------------------- Main Studio Grid */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ------------------------------------------- Main Question & Answer Desk */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-border/80">
            <CardHeader
              title={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-semibold text-foreground">
                    Interview Prompt
                  </span>
                  {/* TTS Voice Readout */}
                  {tts.isSupported && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          if (tts.isSpeaking) tts.stop();
                          else tts.speak(question.prompt);
                        }}
                        className="text-xs"
                      >
                        {tts.isSpeaking ? (
                          <>
                            <VolumeX className="size-3.5 text-rose-500" />
                            Stop Voice
                          </>
                        ) : (
                          <>
                            <Volume2 className="size-3.5 text-primary-600" />
                            Listen to Question
                          </>
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setAutoReadQuestion((prev) => !prev)}
                        className={cn(
                          "rounded-md px-2 py-1 text-[11px] font-medium transition-colors border",
                          autoReadQuestion
                            ? "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/50 dark:text-primary-300 dark:border-primary-800"
                            : "text-muted-foreground border-border hover:bg-muted",
                        )}
                        title="Automatically read questions aloud with speech synthesis"
                      >
                        Auto-Read: {autoReadQuestion ? "ON" : "OFF"}
                      </button>
                    </div>
                  )}
                </div>
              }
              subtitle={`${timeLimit}s response window · Speak your answer aloud clearly into your microphone`}
            />

            <CardBody className="space-y-5">
              <Progress value={progress} className="h-1.5" />

              {/* TTS Speaking Indicator */}
              {tts.isSpeaking && (
                <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 animate-pulse">
                  <Volume2 className="size-4 animate-bounce text-sky-600 dark:text-sky-400" />
                  <span>AI Interviewer is reading the question prompt aloud...</span>
                </div>
              )}

              {/* Question Statement */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <h2 className="text-lg font-semibold leading-relaxed text-foreground tracking-tight">
                  {question.prompt}
                </h2>
              </div>

              {/* Hints Accordion */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    Hints {revealedHints}/{question.hints.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={revealHint}
                    disabled={!moreHintsLeft || saving}
                    className="text-xs"
                  >
                    {revealedHints === 0 ? "Need a hint?" : "Show next hint"}
                  </Button>
                </div>

                {question.hints.slice(0, revealedHints).map((hint, hintIndex) => (
                  <div
                    key={hint}
                    className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-100"
                  >
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <span>
                      <strong className="font-semibold">Hint {hintIndex + 1}:</strong> {hint}
                    </span>
                  </div>
                ))}

                {revealedHints > 0 && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    * Using hints applies a minor adjustment to the raw mark for this question.
                  </p>
                )}
              </div>

              {/* Thinking Pad (Candidate scratchpad for structuring answers) */}
              <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                <div className="flex items-center justify-between bg-muted/40 px-3 py-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowNotes((prev) => !prev)}
                    className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary-600 transition-colors"
                  >
                    <PenLine className="size-3.5" />
                    {showNotes ? "Hide Thinking Scratchpad" : "Open Thinking Scratchpad (Notes)"}
                    {currentNotes.trim() && (
                      <span className="size-1.5 rounded-full bg-primary-600" />
                    )}
                  </button>

                  {showNotes && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSTARInsert}
                        className="rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        + Insert STAR Template
                      </button>
                      {currentNotes && (
                        <button
                          type="button"
                          onClick={() => handleNotesChange("")}
                          className="rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {showNotes && (
                  <div className="p-3">
                    <textarea
                      value={currentNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Jot down bullet points, key technical terms, or outline your response before/while speaking..."
                      className="w-full resize-y rounded-lg border border-border bg-background p-2.5 text-xs font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      rows={3}
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      * Notes are for your personal reference during this question and are not submitted to the recruiter.
                    </p>
                  </div>
                )}
              </div>

              {/* Live Audio Visualizer & Speech Telemetry HUD */}
              <div className="rounded-xl border border-border bg-slate-950 p-4 text-white shadow-inner">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-300">
                      <Mic className="size-3.5 text-sky-400" /> Live Speech AI
                    </span>
                    {recordingActive && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-500/30">
                        <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                        REC
                      </span>
                    )}
                  </div>

                  {/* Real-time stats pills */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 text-slate-300">
                      {speechStats.wordCount} words
                    </span>
                    {speechStats.wpm > 0 && (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5",
                          speechStats.wpm >= 110 && speechStats.wpm <= 165
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                            : "bg-slate-800/80 text-slate-300",
                        )}
                        title="Speaking pace (Words per minute)"
                      >
                        {speechStats.wpm} WPM · {speechStats.paceLabel}
                      </span>
                    )}
                    {speechStats.fillerCount > 0 && (
                      <span className="rounded bg-amber-950/80 px-2 py-0.5 text-amber-300 border border-amber-800/50">
                        {speechStats.fillerCount} fillers
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated Audio Frequency Waves */}
                <div className="py-1">
                  <AudioWaveVisualizer
                    analyser={proctor.getAnalyser ? proctor.getAnalyser() : null}
                    micLevel={proctor.micLevel}
                    isActive={recordingActive}
                    height={32}
                    barCount={36}
                  />
                </div>

                {/* Live Transcript Display */}
                <div className="mt-2 min-h-[64px] rounded-lg bg-slate-900/80 p-3 text-xs leading-relaxed text-slate-200 border border-slate-800/60 font-sans">
                  {transcript || interim ? (
                    <span>
                      {transcript}
                      {interim && (
                        <span className="italic text-sky-400"> {interim}</span>
                      )}
                      <span className="inline-block size-1.5 ml-1 rounded-full bg-sky-400 animate-ping" />
                    </span>
                  ) : (
                    <span className="italic text-slate-500">
                      Listening for your spoken answer... Speak naturally into your microphone and the AI will transcribe and review each concept.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {finished ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-6 text-sm font-medium text-muted-foreground">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                  Answer saved! Finalizing session and submitting for AI evaluation…
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void finishQuestion("SKIPPED", "CANDIDATE_SUBMIT")}
                    disabled={saving}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="size-3.5" />
                    Skip question
                  </Button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void finishQuestion("SUBMITTED", "CANDIDATE_SUBMIT")}
                      disabled={saving}
                    >
                      Save answer
                    </Button>

                    <Button
                      onClick={() => void finishQuestion("SUBMITTED", "CANDIDATE_SUBMIT")}
                      disabled={saving}
                      loading={saving}
                      className="min-w-[150px] shadow-sm"
                    >
                      {isLast ? "Finish & Submit Interview" : "Next Question"}
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------- Studio Proctor HUD (Right) */}
        <aside className="space-y-4">
          <Card className="overflow-hidden border-border/80">
            <CardBody className="p-3 space-y-3">
              {/* Webcam viewport with HUD overlays */}
              <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-video shadow-inner">
                <video
                  ref={proctor.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="size-full object-cover"
                />

                {/* Floating Top Badges */}
                <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                  {recordingActive ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                      <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      REC
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                      PAUSED
                    </span>
                  )}

                  <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                    <ShieldCheck className="size-3 text-emerald-400" />
                    Proctored
                  </span>
                </div>

                {/* Floating Live Captions on Video */}
                {showLiveCaptions && (transcript || interim) && (
                  <div className="absolute bottom-2 inset-x-2 rounded-lg bg-black/80 px-2.5 py-1.5 text-center text-[11px] leading-tight text-white backdrop-blur-md pointer-events-none shadow-md">
                    <span className="text-slate-300 line-clamp-2">
                      {interim || transcript.slice(-80)}
                    </span>
                  </div>
                )}
              </div>

              {/* Captions toggle button */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <button
                  type="button"
                  onClick={() => setShowLiveCaptions((prev) => !prev)}
                  className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors"
                >
                  <Subtitles className="size-3.5" />
                  {showLiveCaptions ? "Hide Video Subtitles" : "Show Video Subtitles"}
                </button>

                <span className="text-[11px] font-mono">
                  Mic: {Math.round(proctor.micLevel * 100)}%
                </span>
              </div>

              {/* Proctor status metrics */}
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Camera className="size-3.5" /> Camera
                  </span>
                  <Badge tone={proctor.cameraStatus === "ready" ? "green" : "red"} size="sm">
                    {proctor.cameraStatus === "ready" ? "Online" : "Off"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Eye className="size-3.5" /> Face Detection
                  </span>
                  <span className="font-medium text-foreground">
                    {proctor.faceDetectorAvailable ? (
                      proctor.faceCount === 1 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          1 Face Verified
                        </span>
                      ) : proctor.faceCount && proctor.faceCount > 1 ? (
                        <span className="text-rose-600 font-bold">Multiple Faces!</span>
                      ) : (
                        <span className="text-amber-600">No Face Detected</span>
                      )
                    ) : (
                      "Active"
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5" /> Screen Mode
                  </span>
                  <Badge tone={proctor.inFullscreen ? "green" : "amber"} size="sm">
                    {proctor.inFullscreen ? "Full Screen" : "Windowed"}
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Guidelines HUD */}
          <Card className="border-border/80">
            <CardHeader
              title="Anti-Cheating Policy"
              subtitle="Server telemetry is actively recording"
            />
            <CardBody className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-1.5 text-foreground font-medium">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Evidence snapshot captures enabled
              </p>
              <p>
                Switching windows or tabs, leaving full-screen, external electronic devices, or
                multiple voices will trigger an infraction and suspend the session immediately.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
