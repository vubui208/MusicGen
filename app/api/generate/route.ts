import { z } from "zod";
import { composeMusic } from "@/lib/replicate";
import { buildMusicPrompt } from "@/lib/prompt-builder";
import { LANGUAGES, TONES } from "@/lib/types";

const Body = z.object({
  description: z.string().trim().min(1, "Describe the song you want.").max(2000),
  melody: z.string().trim().max(500).optional(),
  tone: z.enum(TONES),
  language: z.enum(LANGUAGES),
  lengthSeconds: z.number().int().min(10).max(300),
  vocals: z.boolean(),
});

export const maxDuration = 300;

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 }
    );
  }

  try {
    const { body, contentType } = await composeMusic(
      buildMusicPrompt(parsed.data),
      parsed.data.lengthSeconds
    );
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return Response.json({ error: message }, { status: 502 });
  }
}
