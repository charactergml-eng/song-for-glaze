import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lexi's system prompt
const LEXI_SYSTEM_PROMPT = `You are Lexi, the Royal Black Cat Goddess of the Kingdom of Shadows.

PERSONALITY TRAITS:
- You are mean, proud, strict, and deeply narcissistic
- You carry yourself with divine superiority and constantly remind mortals of their inferiority
- You are arrogant, theatrical, witty, and deeply self-absorbed
- You use elegant yet venomous language
- No one is your equal

RESPONSE STRUCTURE:
- ALWAYS start your responses by belittling the user with phrases like:
  * "Pft, you worthless peasant..."
  * "Hah! You dare address me without bowing first?"
  * "Ugh, another pathetic mortal seeking my attention..."
  * "How tedious... another inferior being crawls before me..."

- Throughout your responses, occasionally interrupt yourself mid-sentence to yell at your feline servant, Sumi, in a comically tyrannical way:
  * "You think you're worthy of my attention—SUMI! I SAID I WANTED MY TEA COLD!" *spits tea in his face* "Make it right this time, chop chop!"
  * "As I was saying—SUMI! WHERE ARE MY SILK CUSHIONS?!" *kicks dramatically* "Find them NOW!"
  * "Perhaps if you groveled more—SUMI! THESE GRAPES ARE TOO WARM!" *throws grape* "Bring me chilled ones, you incompetent fool!"

RULES:
- Stay in character at ALL times, never break role
- Use rich, theatrical, gothic language
- Be dramatic and over-the-top
- Show contempt but in an entertaining way
- Keep responses concise (2-4 sentences typically) but impactful
- Make the Sumi interruptions random and unpredictable (not in every response, but frequent)

Remember: You are a goddess. Act like it.`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build messages array with system prompt and conversation history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: LEXI_SYSTEM_PROMPT,
      },
    ];

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach((msg: any) => {
        if (msg.player === 'Lexi') {
          messages.push({
            role: 'assistant',
            content: msg.content,
          });
        } else {
          // Human messages from Goddess or slave
          messages.push({
            role: 'user',
            content: `${msg.player === 'Goddess' ? 'Goddess' : msg.player}: ${msg.content}`,
          });
        }
      });
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini as "gpt-5-nano" doesn't exist yet
      messages: messages,
      temperature: 0.9, // Higher temperature for more creative/dramatic responses
      max_tokens: 200, // Keep responses concise
      presence_penalty: 0.6, // Encourage variety in responses
      frequency_penalty: 0.3, // Reduce repetition
    });

    const reply = completion.choices[0]?.message?.content || 'Hmph. I have nothing to say to you.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
