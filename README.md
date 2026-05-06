# MusicGen

A minimal AI music generator — describe a track, set the mood, pick the length, and generate it instantly. Built with Next.js 16, React 19, and Tailwind v4, powered by [Replicate](https://replicate.com) and the `meta/musicgen` model.

![Dark monochrome UI with a visualizer and generate button](https://github.com/vubui208/MusicGen/raw/main/public/preview.png)

---

## Features

- Describe any song in plain text
- Choose tone (Happy, Sad, Energetic, Calm, Dark, Epic…)
- Set language / vocal style or go fully instrumental
- Adjust track length up to 30 seconds
- Custom audio player with play/pause, scrub bar, and download
- Animated visualizer while generating
- Pure black monochrome design

---

## Getting Started (Local Setup)

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- A free [Replicate](https://replicate.com) account

### 2. Clone the repo

```bash
git clone https://github.com/vubui208/MusicGen.git
cd MusicGen
```

### 3. Install dependencies

```bash
npm install
```

### 4. Get your Replicate API token

1. Sign up at [replicate.com](https://replicate.com)
2. Go to **Account Settings → API Tokens**
3. Create a new token and copy it

### 5. Create the environment file

Create a file called `.env.local` in the root of the project:

```bash
touch .env.local
```

Open it and add your token:

```
REPLICATE_API_KEY=your_replicate_token_here
```

> Your `.env.local` file is ignored by git and will never be committed.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

1. **Describe your track** — type what you want to hear in the Description field (e.g. *"A soulful lo-fi hip hop beat with soft piano and warm vinyl crackle"*)
2. **Add instrumentation** *(optional)* — specify instruments like `piano`, `guitar`, `synth`
3. **Pick a Tone** — select the mood from the dropdown
4. **Pick a Language** — choose a vocal language or select `Instrumental` for no vocals
5. **Toggle Vocals** — switch on/off to force instrumental output
6. **Set Length** — drag the slider (up to 30 seconds)
7. **Press Generate** — wait 15–30 seconds while the track is composed
8. **Play & Download** — use the built-in player or click download to save the MP3

---

## Example Prompts

| Style | Prompt |
|---|---|
| Lo-fi study | A soulful lo-fi hip hop beat with soft piano chords, warm vinyl crackle, and a slow jazzy drum loop |
| Cinematic | An epic orchestral piece with sweeping strings, thundering timpani, and a triumphant brass fanfare |
| Chill electronic | Dreamy ambient electronica with soft synthesizer pads, a gentle pulsing bassline, and subtle arpeggiated melodies |
| Dark atmosphere | A dark cinematic drone with deep cello layers, eerie high strings, and subtle dissonant piano notes |

---

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, React Server Components
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Replicate API](https://replicate.com) — `meta/musicgen` model
- [Zod](https://zod.dev) — API input validation

---

## Environment Variables

| Variable | Description |
|---|---|
| `REPLICATE_API_KEY` | Your Replicate API token (`r8_...`) |

---

## License

MIT
