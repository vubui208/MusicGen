"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, TONES, type FormInput } from "@/lib/types";

type UiState =
  | { kind: "idle" }
  | { kind: "generating"; startedAt: number; abort: AbortController }
  | { kind: "done"; audioUrl: string; durationSeconds: number }
  | { kind: "error"; message: string };

const DEFAULTS: FormInput = {
  description: "",
  melody: "",
  tone: "Energetic",
  language: "English",
  lengthSeconds: 60,
  vocals: true,
};

export default function Home() {
  const [form, setForm] = useState<FormInput>(DEFAULTS);
  const [ui, setUi] = useState<UiState>({ kind: "idle" });
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    };
  }, []);

  function update<K extends keyof FormInput>(key: K, value: FormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lastUrl.current) {
      URL.revokeObjectURL(lastUrl.current);
      lastUrl.current = null;
    }

    const abort = new AbortController();
    setUi({ kind: "generating", startedAt: Date.now(), abort });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: abort.signal,
      });

      if (!res.ok) {
        const envelope = (await res.json().catch(() => null)) as { error?: string } | null;
        setUi({
          kind: "error",
          message: envelope?.error ?? `Request failed (${res.status})`,
        });
        return;
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      lastUrl.current = audioUrl;
      setUi({ kind: "done", audioUrl, durationSeconds: form.lengthSeconds });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setUi({ kind: "idle" });
        return;
      }
      const message = err instanceof Error ? err.message : "Network error.";
      setUi({ kind: "error", message });
    }
  }

  function cancel() {
    if (ui.kind === "generating") ui.abort.abort();
  }

  function reset() {
    if (ui.kind === "generating") ui.abort.abort();
    if (lastUrl.current) {
      URL.revokeObjectURL(lastUrl.current);
      lastUrl.current = null;
    }
    setUi({ kind: "idle" });
  }

  const busy = ui.kind === "generating";
  const visualizerActive = ui.kind === "generating" || ui.kind === "done";

  return (
    <div className="relative isolate min-h-svh overflow-hidden">
      <BackgroundAura />

      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-7">
        <div className="flex items-center gap-2 text-[13px] tracking-tight">
          <span className="size-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
          <span className="font-medium">Music</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
          ElevenLabs · v1
        </span>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 pb-28 pt-20">
        <h1 className="text-[clamp(2.4rem,6vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.025em] text-balance">
          Compose a track in seconds.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/40">
          Describe what you want to hear. Pick a tone and length. Press generate.
        </p>

        <form onSubmit={onSubmit} className="mt-14 space-y-12">
          <Section label="Description">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="A late-night lo-fi beat with warm Rhodes piano and soft tape hiss."
              disabled={busy}
              className="block w-full resize-none border-0 bg-transparent text-[20px] leading-snug text-white placeholder:text-white/20 focus:outline-none focus:ring-0 disabled:opacity-40"
            />
          </Section>

          <Section label="Instrumentation" hint="Optional">
            <input
              type="text"
              value={form.melody ?? ""}
              onChange={(e) => update("melody", e.target.value)}
              placeholder="Soft piano, 808 bass, fingerpicked guitar…"
              disabled={busy}
              className="block w-full border-0 bg-transparent text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:ring-0 disabled:opacity-40"
            />
          </Section>

          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
            <Field label="Tone">
              <CustomSelect
                value={form.tone}
                options={TONES}
                onChange={(v) => update("tone", v)}
                disabled={busy}
              />
            </Field>
            <Field label="Language">
              <CustomSelect
                value={form.language}
                options={LANGUAGES}
                onChange={(v) => update("language", v)}
                disabled={busy}
              />
            </Field>
            <Field label="Vocals">
              <Switch
                checked={form.vocals && form.language !== "Instrumental"}
                onChange={(v) => update("vocals", v)}
                disabled={busy || form.language === "Instrumental"}
                hint={form.language === "Instrumental" ? "Off (instrumental)" : form.vocals ? "On" : "Off"}
              />
            </Field>
          </div>

          <Field
            label="Length"
            right={
              <span className="font-mono text-[13px] tabular-nums text-white/60">
                {form.lengthSeconds}s
              </span>
            }
          >
            <Slider
              min={10}
              max={300}
              step={10}
              value={form.lengthSeconds}
              onChange={(v) => update("lengthSeconds", v)}
              disabled={busy}
            />
          </Field>

          <Visualizer mode={visualizerActive ? "active" : "idle"} />

          <div className="flex items-center gap-5">
            <button
              type="submit"
              disabled={busy || !form.description.trim()}
              className="group relative inline-flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-white to-zinc-200 px-8 text-[14px] font-medium tracking-tight text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_0_24px_rgba(255,255,255,0.06)] transition-all duration-200 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_0_44px_rgba(255,255,255,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_0_24px_rgba(255,255,255,0.06)]"
            >
              <span className="relative">{busy ? "Generating…" : "Generate"}</span>
              {busy && (
                <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
                  <span className="block h-full w-1/3 animate-[slide_1.6s_ease-in-out_infinite] bg-black/30" />
                </span>
              )}
            </button>
            {busy && (
              <button
                type="button"
                onClick={cancel}
                className="text-[13px] text-white/40 transition-colors hover:text-white/80"
              >
                Cancel
              </button>
            )}
            {ui.kind === "done" && (
              <button
                type="button"
                onClick={reset}
                className="text-[13px] text-white/40 transition-colors hover:text-white/80"
              >
                New track
              </button>
            )}
          </div>

          <Status ui={ui} />
        </form>
      </main>

      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}

/* ---------- Layout primitives ---------- */

function BackgroundAura() {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_100%,rgba(255,255,255,0.04),transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black" />
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/35">
      {children}
    </span>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {hint && (
          <span className="text-[10.5px] uppercase tracking-[0.18em] text-white/25">{hint}</span>
        )}
      </div>
      {children}
      <div className="h-px w-full bg-white/[0.06]" />
    </div>
  );
}

function Field({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ---------- Custom controls ---------- */

function CustomSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-2 text-left text-[15px] text-white/90 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>{value}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`shrink-0 text-white/40 transition-transform duration-200 ${
            open ? "rotate-180 text-white/70" : ""
          }`}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="fade-scale-in absolute left-0 right-0 top-full z-30 mt-3 max-h-64 overflow-y-auto rounded-xl border border-white/[0.07] bg-zinc-950/85 p-1 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {options.map((o) => {
            const selected = o === value;
            return (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition-colors ${
                  selected
                    ? "bg-white/[0.06] text-white"
                    : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span>{o}</span>
                {selected && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-white/80"
                  >
                    <path
                      d="M2.5 6.2l2.4 2.4L9.5 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full border transition-all duration-200 ${
          checked
            ? "border-white/20 bg-white shadow-[0_0_18px_rgba(255,255,255,0.25)]"
            : "border-white/10 bg-white/[0.06]"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <span
          className={`absolute top-1/2 size-[14px] -translate-y-1/2 rounded-full transition-all duration-200 ${
            checked ? "left-[22px] bg-black" : "left-[3px] bg-white/70"
          }`}
        />
      </button>
      {hint && (
        <span className="text-[13px] text-white/40">{hint}</span>
      )}
    </div>
  );
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="range-slider"
      style={{ ["--progress" as string]: `${pct}%` } as React.CSSProperties}
    />
  );
}

/* ---------- Visualizer ---------- */

function Visualizer({ mode }: { mode: "active" | "idle" }) {
  const bars = useMemo(() => {
    const count = 64;
    return Array.from({ length: count }, (_, i) => {
      const height = 18 + Math.abs(Math.sin(i * 0.32)) * 70 + Math.abs(Math.cos(i * 0.11)) * 14;
      const dur = 0.9 + Math.abs(Math.sin(i * 0.27)) * 1.6;
      const delay = (i % 17) * 0.06;
      return { height: Math.min(98, height), dur, delay };
    });
  }, []);

  return (
    <div className="relative h-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_50%,rgba(255,255,255,0.04),transparent_75%)]" />
      <div className="flex h-full items-center justify-center gap-[2px]">
        {bars.map((b, i) => (
          <span
            key={i}
            className={`vis-bar block w-[2px] rounded-full bg-gradient-to-t from-white/20 via-white/60 to-white ${
              mode === "active" ? "is-active" : "is-idle"
            }`}
            style={{
              height: `${b.height}%`,
              ["--dur" as string]: `${b.dur.toFixed(2)}s`,
              ["--delay" as string]: `${b.delay.toFixed(2)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Status / audio ---------- */

function Status({ ui }: { ui: UiState }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (ui.kind !== "generating") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ui.kind]);

  if (ui.kind === "idle") return null;

  if (ui.kind === "error") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.03] px-4 py-3 backdrop-blur-xl">
        <span className="mt-1.5 size-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]" />
        <div className="flex-1 text-[13px]">
          <div className="font-medium text-red-200/95">Generation failed</div>
          <div className="mt-0.5 text-red-200/60">{ui.message}</div>
        </div>
      </div>
    );
  }

  if (ui.kind === "generating") {
    const elapsed = Math.max(0, Math.floor((now - ui.startedAt) / 1000));
    return (
      <div className="flex items-center justify-between text-[13px] text-white/50">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          Composing your track…
        </div>
        <span className="font-mono tabular-nums text-white/35">{elapsed}s</span>
      </div>
    );
  }

  return <AudioPlayer src={ui.audioUrl} />;
}

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    function onTime() {
      if (a) setCurrent(a.currentTime);
    }
    function onLoaded() {
      if (a) setDuration(a.duration);
    }
    function onEnd() {
      setPlaying(false);
    }
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnd);
    };
  }, [src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      void a.play();
      setPlaying(true);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !duration || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setCurrent(a.currentTime);
  }

  const pct = duration && isFinite(duration) ? (current / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-4 rounded-full border border-white/[0.07] bg-white/[0.02] py-2.5 pl-2.5 pr-4 backdrop-blur-xl">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="grid size-9 place-items-center rounded-full bg-white text-black transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <rect x="2.5" y="2" width="2.5" height="8" rx="0.6" />
            <rect x="7" y="2" width="2.5" height="8" rx="0.6" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path d="M3 1.8v8.4c0 .6.65.97 1.16.66l6.84-4.2a.78.78 0 000-1.32L4.16 1.14A.78.78 0 003 1.8z" />
          </svg>
        )}
      </button>
      <div
        className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.07]"
        onClick={seek}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/85"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_12px_rgba(255,255,255,0.45)] transition-opacity group-hover:opacity-100"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-white/45">
        {fmtTime(current)} / {fmtTime(duration)}
      </span>
      <a
        href={src}
        download="generated-music.mp3"
        aria-label="Download"
        className="text-white/40 transition-colors hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 1v8m0 0L4 6m3 3l3-3M2 12h10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
