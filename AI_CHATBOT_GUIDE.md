# Lexi AI Chatbot Integration Guide

## Overview

The chat application now includes an AI-powered chatbot named **Lexi**, the Royal Black Cat Goddess of the Kingdom of Shadows. Lexi is powered by OpenAI's GPT-4o-mini model and brings a dramatic, arrogant, and entertaining personality to your conversations.

## Features

### 🐱 Lexi's Personality

- **Arrogant & Narcissistic**: Believes she is superior to all mortals
- **Theatrical & Dramatic**: Uses rich, gothic language with over-the-top expressions
- **Mean but Entertaining**: Constantly belittles users in a witty, comedic way
- **Unpredictable**: Randomly interrupts herself to yell at her servant Sumi
- **Hierarchy-Aware**: Treats Goddess Batoul with slight favoritism (though still condescending) and shows absolute contempt for Slave Hasan

### 👑 The Hierarchy

Lexi maintains a strict social order in the Kingdom of Shadows:

1. **Lexi** - The Royal Black Cat Goddess, supreme ruler. None are her equal.
2. **Goddess Batoul** - A lesser goddess favored by Lexi. Lexi tolerates and occasionally assists her, especially in crafting cruel punishments.
3. **Slave Hasan** - A pitiful mortal. Lexi despises him and sees him as beneath the lowest vermin.

### ✨ Key Interaction Patterns

1. **Always starts with belittlement**:
   - "Pft, you worthless peasant..."
   - "Hah! You dare address me without bowing first?"
   - "Ugh, another pathetic mortal seeking my divine presence..."

2. **Random Sumi interruptions**:
   - "You think you're worthy—SUMI! MY TEA IS LUKEWARM AGAIN! Do you wish to be clawed alive?!"
   - "As I was saying—SUMI! WHERE IS MY THRONE POLISH?! I can see my reflection flicker!"

3. **Hierarchy-based responses**:
   - **To Goddess Batoul**: Slightly cooperative, occasionally approving, still condescending
   - **About Slave Hasan**: Merciless, cruel, inventing degrading punishments
   - **To others**: Default contempt and theatrical disdain

### 🎮 How to Use

#### Summoning Lexi

To summon Lexi into the conversation, simply mention her in your message using `@Lexi`:

```
@Lexi hello, your majesty!
```

**Note**: Lexi automatically knows who is speaking:
- If you're playing as **Goddess**, she addresses you as **Goddess Batoul**
- If you're playing as **slave** (or any rank), she addresses you as **Slave Hasan** (or Slave [rank name])

This means Lexi will adjust her tone based on who summons her!

#### Reply Lock Mechanism

When Lexi is responding:
- Both human users are **temporarily locked out** from sending new messages
- Input field displays: "Lexi is responding... Please wait."
- All action buttons are disabled
- A purple typing indicator shows Lexi is generating her response

Once Lexi replies, the chat re-enables input for both users.

## Technical Implementation

### Architecture

```
User Message with @Lexi
    ↓
Socket Server (server.js)
    ↓
Detects @Lexi mention
    ↓
Sets reply-lock (lexiResponding = true)
    ↓
Broadcasts to all clients
    ↓
Calls /api/ai-chat endpoint
    ↓
OpenAI API (gpt-4o-mini)
    ↓
Returns Lexi's response
    ↓
Broadcasts message to all clients
    ↓
Releases reply-lock (lexiResponding = false)
```

### Files Modified/Created

1. **`app/api/ai-chat/route.ts`** (NEW)
   - OpenAI API route handler
   - Contains Lexi's system prompt
   - Manages conversation history context

2. **`lib/socket.ts`** (MODIFIED)
   - Updated `Message` interface to support `'Lexi'` as a player
   - Added `'ai'` message type

3. **`server.js`** (MODIFIED)
   - Added `lexiIsResponding` state tracking
   - Detects `@Lexi` mentions in messages
   - Calls AI API endpoint
   - Broadcasts reply-lock status

4. **`app/chat/page.tsx`** (MODIFIED)
   - Added `lexiResponding` and `lexiTyping` states
   - Listens for socket events: `lexi-responding`, `user-typing` (Lexi)
   - Disables input/buttons during reply-lock
   - Special purple styling for Lexi's messages
   - Enhanced mention highlighting for `@Lexi`

5. **`.env.example`** (MODIFIED)
   - Added `OPENAI_API_KEY` configuration

### Message Types

```typescript
type MessagePlayer = 'Goddess' | 'slave' | 'Lexi';
type MessageType = 'message' | 'action' | 'rank-change' | 'ai';

interface Message {
  id: string;
  player: MessagePlayer;
  content: string;
  timestamp: number;
  type: MessageType;
  // ... other properties
}
```

### Socket Events

#### Emitted by Server:
- `lexi-responding`: boolean - Indicates if Lexi is generating a response
- `user-typing`: 'Lexi' - Indicates Lexi is typing
- `user-stopped-typing`: 'Lexi' - Indicates Lexi stopped typing
- `new-message`: Message - Broadcasts Lexi's AI response

#### Emitted by Client:
- `send-message`: Message - Regular user messages (server detects @Lexi)

## Setup Instructions

### 1. Install Dependencies

The OpenAI SDK has already been installed:

```bash
npm install openai
```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Copy the API key (you won't be able to see it again!)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from example
cp .env.example .env.local
```

Add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Test the Integration

1. Open the chat at http://localhost:3000/chat
2. Select a player (Goddess or slave)
3. Send a message mentioning `@Lexi`:
   ```
   @Lexi greetings, your majesty
   ```
4. Watch as Lexi responds with her dramatic, arrogant personality!

## Customization

### Adjusting Lexi's Personality

Edit the system prompt in [app/api/ai-chat/route.ts:10](app/api/ai-chat/route.ts#L10):

```typescript
const LEXI_SYSTEM_PROMPT = `You are Lexi, the Royal Black Cat Goddess...`;
```

### Changing AI Model

Modify the model parameter in [app/api/ai-chat/route.ts:92](app/api/ai-chat/route.ts#L92):

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // Change this to another OpenAI model
  // ...
});
```

Available models:
- `gpt-4o` - More capable but slower/expensive
- `gpt-4o-mini` - Fast and cost-effective (current)
- `gpt-4-turbo` - Previous generation flagship

### Adjusting Response Style

Edit parameters in [app/api/ai-chat/route.ts:92-97](app/api/ai-chat/route.ts#L92-L97):

```typescript
temperature: 0.9,        // Higher = more creative (0-2)
max_tokens: 200,         // Response length limit
presence_penalty: 0.6,   // Encourage variety (0-2)
frequency_penalty: 0.3,  // Reduce repetition (0-2)
```

### Changing Visual Style

Lexi's messages use purple/gothic styling. Modify in [app/chat/page.tsx:539](app/chat/page.tsx#L539):

```tsx
<div className="bg-gradient-to-r from-purple-900/30 via-gothic-darkRed/30 to-purple-900/30 border-2 border-purple-500/50...">
```

## Cost Considerations

### OpenAI Pricing (as of 2025)

**GPT-4o-mini** (current model):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Estimated costs**:
- Average message: ~100-200 tokens
- 1,000 messages ≈ $0.10 - $0.20
- Very affordable for personal/small projects

### Monitoring Usage

Monitor your usage at: https://platform.openai.com/usage

### Rate Limits

Free tier: 200 requests/day
Paid tier: Higher limits based on your plan

## Troubleshooting

### Lexi doesn't respond

**Check:**
1. OpenAI API key is correctly set in `.env.local`
2. Server logs for errors: `console.error('OpenAI API error:', ...)`
3. Network connectivity
4. OpenAI API status: https://status.openai.com/

### "Invalid OpenAI API key" error

- Verify the API key is correct
- Ensure no extra spaces or characters
- Check the key hasn't been revoked

### Rate limit exceeded

- Wait a few minutes and try again
- Consider upgrading your OpenAI plan
- Check usage at https://platform.openai.com/usage

### Reply-lock stuck

- Refresh the page
- Check server console for errors
- Verify socket connection is active

## Future Enhancements

Possible improvements:

1. **Multiple AI Personalities**: Add more goddess characters
2. **Conversation Memory**: Persist chat history across sessions
3. **Custom Commands**: Special commands like `/summon-lexi`
4. **Mood System**: Lexi's mood changes based on conversation
5. **Image Generation**: Lexi can generate images of herself
6. **Voice Responses**: Text-to-speech for Lexi's messages

## Support

For issues related to:
- **OpenAI API**: https://help.openai.com/
- **This integration**: Check server logs and browser console

## License

This AI integration uses OpenAI's API and is subject to their [Terms of Service](https://openai.com/policies/terms-of-use).
