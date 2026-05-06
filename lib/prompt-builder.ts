import type { FormInput } from "./types";

export function buildMusicPrompt(form: FormInput): string {
  const description = form.description.trim();
  const melody = form.melody?.trim() ?? "";
  const isInstrumental = !form.vocals || form.language === "Instrumental";

  const parts: string[] = [
    `${form.tone} ${isInstrumental ? "instrumental" : "song"}: ${description}`,
  ];
  if (melody) parts.push(`Instrumentation: ${melody}.`);
  if (!isInstrumental) parts.push(`Vocals in ${form.language}.`);

  return parts.join(" ").slice(0, 1000);
}
