🎵 MusicGen

MusicGen is a minimal AI-powered music generator. Describe a track, set the mood, pick the length, and generate it instantly. Built with Next.js 16, React 19, and Tailwind v4, powered by Replicate and the meta/musicgen model.
✨ Features

    📝 Text-to-Music: Describe any song in plain English (e.g., "A soulful lo-fi hip hop beat with soft piano").

    🎭 Mood Selection: Choose from various tones like Happy, Sad, Energetic, Calm, Dark, or Epic.

    🎤 Vocals & Language: Specify a vocal language or toggle for a purely instrumental output.

    ⏱️ Custom Length: Adjust the track duration up to 30 seconds.

    🔊 Advanced Audio Player: Custom UI with play/pause, scrub bar, and high-quality MP3 download.

    🎨 Animated Visualizer: A dynamic wave visualizer that reacts while your track is being composed.

    🌑 Monochrome Aesthetic: A clean, high-end "Pure Black" design for a focused workspace.

🚀 Installation & Local Setup

Follow these steps to get the project running on your local machine.
1. Prerequisites

    Node.js 18.17 or later.

    A Replicate account to access the AI model.

2. Clone the Repository
Bash

git clone https://github.com/vubui208/MusicGen.git
cd MusicGen

3. Install Dependencies
Bash

npm install

4. Set Up Environment Variables

    Create a .env.local file in the root directory:
    Bash

    touch .env.local

    Add your Replicate API token to the file:
    Code snippet

    REPLICATE_API_KEY=your_replicate_token_here

    (You can find your token in your Replicate Dashboard under Account Settings > API Tokens)

5. Run the Development Server
Bash

npm run dev

Open http://localhost:3000 in your browser to see the result.
🎼 How to Use

    Describe: Enter a prompt (e.g., "Dreamy ambient electronica with soft synthesizer pads").

    Configure: Select your preferred tone, language, and track length.

    Generate: Click the "Generate" button. The AI usually takes 15–30 seconds to compose.

    Play & Save: Listen to your creation using the built-in player or click the Download button to save the MP3.

🛠 Tech Stack

    Framework: Next.js 16 (App Router, Server Actions)

    Frontend: React 19

    Styling: Tailwind CSS v4

    AI Engine: Replicate API (meta/musicgen)

    Schema Validation: Zod

📄 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it as you wish.

Created by Vu Bui
