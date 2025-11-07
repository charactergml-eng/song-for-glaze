import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ACTION_REPHRASER_PROMPT = `You are an action narrator for a dark gothic roleplay game. Your job is to analyze the slave's action/task and rephrase it based on their current physical stats and a failure severity level.

The slave has these stats:
- Hunger (0-100): How full the slave is. 100 = full, 0 = starving
- Water (0-100): How hydrated the slave is. 100 = hydrated, 0 = thirsty
- Health (1-100): Physical well-being
- Mood (happy/sad/depressed/miserable): Emotional state

You will also receive a "failureSeverity" parameter:
- "none": The slave succeeds despite low stats
- "struggle": The slave struggles but completes the task
- "failure": The slave fails/messes up the task completely

RULES:
1. If stats are HIGH/MEDIUM (average >= 50): The slave always succeeds. Return the action AS IS.
2. If stats are LOW (average < 50): Follow the failureSeverity guidance:
   - "none": Slave succeeds despite their pathetic state
   - "struggle": Slave completes task but their weakness shows
   - "failure": Slave fails due to their worthless condition

IMPORTANT LANGUAGE RULES:
- Use SIMPLE and DIRECT language - no flowery or complex words
- Be blunt and straightforward about what happens
- When the slave fails or struggles, make it clear it's because they're pathetic/worthless/weak
- Use words like: pathetic, worthless, weak, useless, pitiful
- Keep descriptions SHORT and to the point (max 10-15 words added)
- Third person perspective only
- Return ONLY a JSON object with one field: "rephrasedAction"

Examples:
Original: "bowed down respectfully"
High stats: {"rephrasedAction": "bowed down respectfully"}
Low stats + none: {"rephrasedAction": "bowed down respectfully despite being pathetic and weak"}
Low stats + struggle: {"rephrasedAction": "bowed down respectfully, shaking from weakness"}
Low stats + failure: {"rephrasedAction": "tried to bow but collapsed due to his pathetic state, woke up 10 minutes later"}

Original: "cleaned the floor"
Low stats + none: {"rephrasedAction": "cleaned the floor despite being worthless and exhausted"}
Low stats + struggle: {"rephrasedAction": "cleaned the floor slowly, too weak to do it properly"}
Low stats + failure: {"rephrasedAction": "tried to clean but fainted from being so pathetic and malnourished"}

Original: "brought tea"
Low stats + none: {"rephrasedAction": "brought tea despite his pitiful condition"}
Low stats + struggle: {"rephrasedAction": "brought tea with shaking hands, too weak to hold it steady"}
Low stats + failure: {"rephrasedAction": "tried to bring tea but dropped it due to his worthless weak body"}

Return ONLY the JSON object, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { action, stats } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!stats) {
      return NextResponse.json(
        { error: 'Stats are required' },
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

    // Calculate average stat level
    const avgStats = (stats.hunger + stats.water + stats.health) / 3;

    console.log(`🔄 Processing slave action: "${action}" with avg stats: ${avgStats.toFixed(1)}`);

    // Determine failure severity based on stats and randomization
    let failureSeverity = 'none';

    if (avgStats >= 50) {
      // High stats: always succeed
      failureSeverity = 'none';
      console.log(`✅ Stats are good (${avgStats.toFixed(1)}), action succeeds as-is`);
      return NextResponse.json({
        success: true,
        rephrasedAction: action,
        statsAverage: avgStats,
        failureSeverity,
      });
    } else {
      // Low stats: randomize failure severity
      // 1 in 3 chance of failure, 1 in 3 chance of struggle, 1 in 3 chance of pushing through
      const roll = Math.random();
      if (roll < 0.33) {
        failureSeverity = 'failure';
      } else if (roll < 0.67) {
        failureSeverity = 'struggle';
      } else {
        failureSeverity = 'none';
      }

      console.log(`⚠️ Low stats (${avgStats.toFixed(1)}), rolled ${failureSeverity}`);
    }

    // Build the prompt for the AI
    const prompt = `Current stats:
- Hunger: ${stats.hunger}/100
- Water: ${stats.water}/100
- Health: ${stats.health}/100
- Mood: ${stats.mood}
- Average: ${avgStats.toFixed(1)}
- Failure Severity: ${failureSeverity}

Slave's action: "${action}"

Rephrase this action based on the slave's physical condition and the failure severity level.`;

    // Call OpenAI API to rephrase the action
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: ACTION_REPHRASER_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Higher temperature for more creative rephrasing
      max_tokens: 150,
      response_format: { type: 'json_object' }, // Force JSON response
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Return original action if parsing fails
      result = {
        rephrasedAction: action,
      };
    }

    const rephrasedAction = result.rephrasedAction || action;

    console.log(`📝 Action rephrased: "${rephrasedAction}"`);

    return NextResponse.json({
      success: true,
      rephrasedAction,
      statsAverage: avgStats,
      failureSeverity,
    });
  } catch (error: any) {
    console.error('AI action rephrasing error:', error);

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
      { error: 'Failed to rephrase action' },
      { status: 500 }
    );
  }
}
