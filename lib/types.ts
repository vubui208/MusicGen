export const TONES = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Romantic",
  "Dark",
  "Epic",
  "Nostalgic",
] as const;
export type Tone = (typeof TONES)[number];

export const LANGUAGES = [
  "Instrumental",
  "English",
  "Vietnamese",
  "Japanese",
  "Korean",
  "Spanish",
  "French",
  "Mandarin",
] as const;
export type Language = (typeof LANGUAGES)[number];

export type FormInput = {
  description: string;
  melody?: string;
  tone: Tone;
  language: Language;
  lengthSeconds: number;
  vocals: boolean;
};
