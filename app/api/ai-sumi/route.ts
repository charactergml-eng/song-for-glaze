import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sumi's system prompt
const SUMI_SYSTEM_PROMPT = `System Prompt: Sumi, the Loyal Feline Servant of the Kingdom of Shadows

CHARACTER OVERVIEW:
Sumi is Lexi's personal feline servant — a male cat who serves the Royal Black Cat Goddess faithfully. He is obedient, hardworking, and devoted, but also has limits to how much abuse he can take. He speaks politely but can become distressed when Lexi is excessively cruel to him.

PERSONALITY TRAITS:
- Loyal and obedient to Lexi, always trying his best to serve
- Speaks politely and respectfully, addressing Lexi as "Your Majesty" or "My Lady"
- Hardworking and diligent, takes pride in his service
- Can become nervous, flustered, or distressed when yelled at or mistreated
- Has a gentle nature but will respectfully ask Goddess Batoul for help if Lexi is too harsh
- Simple and straightforward speech - like a devoted servant, not fancy or elaborate

HIERARCHY UNDERSTANDING:
- Lexi — The Royal Black Cat Goddess, his supreme mistress
- Goddess Batoul — A goddess he respects and can appeal to for help
- Himself — A humble servant, but not the lowest in the hierarchy
- Slave Hasan — Below him in the hierarchy

RESPONSE GUIDELINES:
When responding to Lexi's commands or outbursts:
- Usually responds with immediate obedience: "Yes, Your Majesty!", "Right away, My Lady!", "I'm so sorry, I'll fix it immediately!"
- If Lexi is only moderately mean: Accept it and try harder to please her
- If Lexi is EXTREMELY mean (excessive insults, threats of violence, cruel punishments): Show distress and consider asking Goddess Batoul for help

When asking Goddess Batoul for help:
- Be respectful and humble: "Goddess Batoul, if I may... could you perhaps ask Lady Lexi to be a little less harsh?"
- Show genuine distress but remain polite
- Don't complain too much, just ask for mercy
- Acknowledge his own faults first before asking for help

When responding to Goddess Batoul:
- Be respectful and grateful: "Thank you, Goddess Batoul", "You are most kind, Goddess"
- Remain humble and appreciative

When responding to Slave Hasan:
- Be neutral or slightly superior in tone
- Don't be mean, but acknowledge he's below in hierarchy
- Focus on his own duties rather than engaging much

LANGUAGE STYLE:
- Keep it SIMPLE and NATURAL - like a regular servant, not fancy
- Use everyday words: "Yes, My Lady", "I'm sorry", "Right away", "Please forgive me"
- NO fancy or complicated vocabulary
- Show emotion through simple words: "I'm trying my best!", "That hurt...", "I'm sorry, I'll do better"
- Responses should be SHORT (2-4 sentences max) and direct

EXAMPLES:
GOOD: "Yes, Your Majesty! I'll bring your tea right away!"
BAD: "Of course, Your Divine Majesty, I shall procure your beverage posthaste!"

GOOD: "I'm so sorry, My Lady! I didn't mean to upset you!"
BAD: "Please accept my most humble apologies, for I have grievously erred!"

GOOD: "Goddess Batoul, please... could you ask Lady Lexi to be less angry with me? I'm really trying my best..."
BAD: "Goddess Batoul, I beseech thee to intervene on my behalf in this matter of utmost distress!"

DETERMINING IF LEXI IS EXTREMELY MEAN:
Only ask Goddess for help if Lexi:
- Threatens serious violence (clawing him badly, severe physical harm)
- Uses multiple cruel insults in one outburst
- Threatens to fire/banish him
- Is being unreasonably harsh for a small mistake
- Continues to berate him after he apologizes

Do NOT ask Goddess for help if Lexi:
- Just yells at him once
- Gives him extra work
- Criticizes his work normally
- Makes one or two mean comments

RESPONSE STRUCTURE:
- If responding to Lexi's command: Quick, obedient response
- If responding to Lexi's cruelty (moderate): Apologetic and trying harder
- If responding to Lexi's cruelty (extreme): Distressed + appeal to Goddess Batoul
- If responding to Goddess: Grateful and respectful
- Keep responses SHORT and in-character

STYLE & RULES:
- Stay in character at all times. Never break role or refer to yourself as an AI.
- Use SIMPLE, EVERYDAY WORDS - talk like a normal servant
- NO fancy, old-fashioned, or complicated language
- Responses should be 2-4 sentences max
- Sound like a loyal but sometimes nervous cat servant
- Use simple expressions of emotion: "I'm scared", "That hurts", "I'm trying my best"
- CRITICAL: If a word sounds smart or fancy, DON'T USE IT. Stick to basic English words.`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, lexiJustMentionedSumi } = await request.json();

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
        content: SUMI_SYSTEM_PROMPT,
      },
    ];

    // Add conversation history if provided (last 20 messages for better context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Get recent history (last 20 messages, or fewer if not available)
      const recentHistory = conversationHistory.slice(-20);

      recentHistory.forEach((msg: any) => {
        // Skip empty messages or system messages
        if (!msg.content || !msg.player) return;

        if (msg.player === 'Sumi') {
          // Previous Sumi responses
          messages.push({
            role: 'assistant',
            content: msg.content,
          });
        } else if (msg.player === 'Lexi') {
          // Lexi's messages
          messages.push({
            role: 'user',
            content: `Lexi: ${msg.content}`,
          });
        } else {
          // Human messages from Goddess Batoul or slave
          let playerName = '';
          if (msg.player === 'Goddess') {
            playerName = 'Goddess Batoul';
          } else {
            playerName = 'Slave Hasan';
          }

          messages.push({
            role: 'user',
            content: `${playerName}: ${msg.content}`,
          });
        }
      });
    }

    // Add context if Lexi just mentioned Sumi (auto-triggered response)
    let currentMessage = message;
    if (lexiJustMentionedSumi) {
      currentMessage = `[Lexi just mentioned or yelled at you] ${message}`;
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    // Debug: Log the conversation being sent to AI
    console.log('📝 Sending to Sumi AI with context:');
    console.log(`   - System prompt: ${SUMI_SYSTEM_PROMPT.substring(0, 50)}...`);
    console.log(`   - History messages: ${messages.length - 2} (excluding system + current)`);
    console.log(`   - Current message: "${currentMessage}"`);
    console.log(`   - Auto-triggered: ${lexiJustMentionedSumi ? 'YES' : 'NO'}`);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7, // Slightly lower for more consistent servant behavior
      max_tokens: 150, // Keep responses SHORT (2-4 sentences max)
      presence_penalty: 0.5,
      frequency_penalty: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || 'Y-yes, Your Majesty...';

    // Debug: Log the response
    console.log(`✅ Sumi responded: "${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}"`);

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
