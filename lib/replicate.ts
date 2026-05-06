import "server-only";

function getApiKey() {
  const key = process.env.REPLICATE_API_KEY;
  if (!key) {
    throw new Error(
      "REPLICATE_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  return key;
}

export type MusicResult = {
  body: ReadableStream<Uint8Array>;
  contentType: string;
};

type Prediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
};

export async function composeMusic(
  prompt: string,
  durationSeconds: number
): Promise<MusicResult> {
  const key = getApiKey();

  // Create prediction using the standard /v1/predictions endpoint.
  // ?wait=60 tells Replicate to hold the connection up to 60s and return synchronously.
  const createRes = await fetch(
    "https://api.replicate.com/v1/predictions?wait=60",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/musicgen",
        input: {
          prompt,
          duration: Math.min(durationSeconds, 30),
          output_format: "mp3",
          normalization_strategy: "peak",
        },
      }),
      cache: "no-store",
    }
  );

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    throw new Error(
      `Replicate error (${createRes.status}): ${text.slice(0, 500) || createRes.statusText}`
    );
  }

  let prediction: Prediction = await createRes.json();

  // Poll if ?wait=60 timed out (status still starting/processing)
  while (
    prediction.status === "starting" ||
    prediction.status === "processing"
  ) {
    await new Promise((r) => setTimeout(r, 2_500));
    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: { Authorization: `Token ${key}` },
        cache: "no-store",
      }
    );
    if (!pollRes.ok) {
      throw new Error(`Replicate poll failed (${pollRes.status})`);
    }
    prediction = await pollRes.json();
  }

  if (prediction.status !== "succeeded" || !prediction.output) {
    throw new Error(
      `Replicate generation failed: ${prediction.error ?? "unknown error"}`
    );
  }

  const audioUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;

  const audioRes = await fetch(audioUrl, { cache: "no-store" });
  if (!audioRes.ok || !audioRes.body) {
    throw new Error(`Failed to fetch audio (${audioRes.status})`);
  }

  return {
    body: audioRes.body,
    contentType: audioRes.headers.get("content-type") ?? "audio/mpeg",
  };
}
