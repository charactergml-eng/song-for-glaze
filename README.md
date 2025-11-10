# Song for Glaze

A dark, gothic-themed web application with real-time chat, affirmations, and interactive features built with Next.js 16, TypeScript, Socket.io, and Tailwind CSS.

## Features

- **Real-time Chat**: Two-player chat with Socket.io WebSocket connections
- **Action Commands**: Special `/action` system for sending action messages with past tense conversion
- **Affirmations/Glazing**: Interactive affirmation system for two players
- **Song Ideas**: Submit creative song ideas
- **Music Video**: Exclusive music video showcase
- Dark gothic theme with crimson accents and candle-like glow effects

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
```

### Important: Socket.io Deployment Considerations

This app uses a **custom Node.js server** with Socket.io for real-time WebSocket connections. Standard serverless platforms like Vercel don't fully support WebSockets.

### Recommended Deployment Platforms

1. **Railway** (Recommended)
   - Supports WebSockets out of the box
   - Automatic deployments from GitHub
   - Free tier available

2. **Render**
   - Full WebSocket support
   - Easy deployment process
   - Free tier available

3. **DigitalOcean App Platform**
   - Full control over Node.js server
   - Supports long-running processes

4. **Heroku**
   - WebSocket support with session affinity
   - Easy deployment

### Deployment Steps

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Configure your platform:
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Set PORT environment variable (usually auto-detected)
   - Enable WebSocket support if required

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t song-for-glaze .
docker run -p 3000:3000 -e NODE_ENV=production song-for-glaze
```

## Chat Feature - Action Commands

The real-time chat includes a special action command system:

1. Type `/action` to initiate an action command
2. Enter the action verb (e.g. "laughed")
3. Enter target player ("player1" or "player2") or press Enter to skip
4. Enter count and unit (e.g., "3 times", "5 minutes", "100")

The system automatically:
- Converts action verbs to past tense (70+ irregular verbs supported)
- Displays actions centered in italic crimson text
- Broadcasts to both players in real-time

**Example flows:**
- `/action` → "tickle" → "player2" → "3 times" = "player1 tickled player2 3 times"
- `/action` → "sleep" → (skip) → "8 hours" = "player1 slept 8 hours"

## Project Structure

```
song-for-glaze/
├── app/
│   ├── affirmations/          # Affirmations/glazing feature
│   ├── chat/
│   │   └── page.tsx           # Real-time chat page
│   ├── music-video/           # Music video page
│   ├── song-idea/             # Song idea submission
│   ├── api/
│   │   ├── affirmations/      # Affirmations API
│   │   └── socket/            # Socket.io endpoint
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   └── ui/                    # Shadcn UI components
├── lib/
│   ├── socket.ts              # Socket types & interfaces
│   ├── socket-client.ts       # Client-side socket connection
│   └── utils.ts               # Utility functions
├── server.js                  # Custom Node.js server with Socket.io
└── tailwind.config.ts         # Tailwind configuration
```

## Technologies Used

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Socket.io** (Real-time WebSocket communication)
- **Tailwind CSS 4**
- **Framer Motion** (Animations)
- **Shadcn/UI** components
- **Vercel Blob** (Storage)
- **EmailJS** (Email sending)

## Theme Customization

The app uses a gothic color palette defined in `tailwind.config.ts`:

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

Fonts: `Cinzel Decorative` (headers) and `Cinzel` (body)

Animations: `candle-flicker`, `fade-in`, `slide-up`

## Notes

- WebSocket connections require a long-running server process
- Vercel deployment won't support real-time chat without modifications
- Use Railway, Render, or similar platforms for full Socket.io support
- Messages are stored in memory (reset on server restart)
- For persistent storage, integrate a database like MongoDB or PostgreSQL
