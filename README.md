# Gothic Lyrics Player

A dark, gothic-themed Spotify-like lyrics player built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- Custom gothic-styled audio player with play/pause controls and progress bar
- Synchronized lyrics display with Spotify-like animations
- Lyrics pause when audio is buffering
- Automatic navigation to rating form when song ends
- Rating form with optional comment section
- Automated email submission for feedback (using EmailJS)
- Dark red and black gothic theme with candle-like glow effects

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your audio file:
   - Create a `public/audio` directory
   - Place your `.mp3` file at `public/audio/song.mp3`

3. Customize your lyrics and timestamps:
   - Open `app/page.tsx`
   - Replace the `lyrics` and `timestamps` arrays with your own:

```typescript
const lyrics = [
  "Your first line",
  "Your second line",
  // ... more lines
];

const timestamps = [
  0,      // First line starts at 0 seconds
  5.2,    // Second line starts at 5.2 seconds
  // ... more timestamps in seconds
];
```

4. Configure automated email submission:
   - Follow the detailed guide in `EMAILJS_SETUP.md`
   - Set up a free EmailJS account
   - Configure your `.env.local` file with EmailJS credentials

## Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
song-for-glaze/
├── app/
│   ├── rate/
│   │   └── page.tsx          # Rating form page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main player page
│   └── globals.css            # Global styles with gothic theme
├── components/
│   ├── ui/                    # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── AudioPlayer.tsx        # Custom audio player
│   └── LyricsDisplay.tsx      # Synchronized lyrics display
├── lib/
│   └── utils.ts               # Utility functions
├── public/
│   └── audio/
│       └── song.mp3           # Your audio file goes here
└── tailwind.config.ts         # Tailwind configuration with gothic theme
```

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize the gothic color palette:

```typescript
gothic: {
  black: "#0a0a0a",
  darkRed: "#200808",
  deepRed: "#3d1b1b",
  bloodRed: "#8b0000",
  crimson: "#dc143c",
  bone: "#e8e6e3",
}
```

### Fonts

The app uses Google Fonts:
- `Cinzel Decorative` for headers
- `Cinzel` for body text

To change fonts, edit the import in `app/globals.css` and update `tailwind.config.ts`.

### Animations

Customize animations in `tailwind.config.ts`:
- `candle-flicker`: Flickering candle effect
- `fade-in`: Fade in animation
- `slide-up`: Slide up animation

## How It Works

1. **Player Page (`/`):**
   - Displays synchronized lyrics
   - Custom audio player with gothic styling
   - Lyrics animate in sync with audio playback
   - Automatically navigates to rating page when song ends

2. **Rating Page (`/rate`):**
   - Text input for rating (e.g., "10/10", "8", "perfect 9/10")
   - Optional checkbox to enable comment section
   - Automatically sends email via EmailJS (no manual sending required)
   - Shows thank you message after successful submission

## Technologies Used

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn/UI components
- React Hooks
- EmailJS (for automated email sending)

## Notes

- All functionality is client-side (no backend required)
- Email submission is fully automated using EmailJS
- Free tier allows 200 emails per month
- Audio file should be in `.mp3` format
- Timestamps should be in seconds (can include decimals)
