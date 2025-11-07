import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STAT_PROCESSOR_PROMPT = `You are a stat processor for a roleplay game. The slave has the following stats:
- Hunger (0-100): How full the slave is. 100 = full, 0 = starving
- Water (0-100): How hydrated the slave is. 100 = hydrated, 0 = thirsty
- Health (1-100): Physical well-being. Never goes to 0, affects mood
- Mood (happy/sad/depressed/miserable): AUTOMATICALLY CALCULATED based on the average of Hunger, Water, and Health
  * Average >= 70: happy
  * Average >= 50: sad
  * Average >= 30: depressed
  * Average < 30: miserable

Your job is to analyze actions or rank changes and determine how they affect the slave's stats.

IMPORTANT: Mood is automatically calculated from the other stats, so you don't control it directly.
However, keep in mind that your changes to hunger, water, and health will affect the overall mood.

RULES:
1. Return ONLY a valid JSON object with these fields: hungerChange, waterChange, healthChange
2. Changes can be positive (good for slave) or negative (bad for slave)
3. Changes should be reasonable: typically -20 to +20, with extreme actions going up to -30 or +30
4. Consider the psychological and physical impact of the action
5. Promotions generally improve stats, demotions generally decrease them
6. Actions that are humiliating, painful, or degrading typically decrease health
7. Actions that provide food/water obviously increase hunger/water
8. Being ignored or neglected decreases stats slowly over time
9. Praise or affection improves health
10. Remember that all three stats contribute to mood - consider the overall impact

Examples:
- "Goddess kicked slave" -> {"hungerChange": 0, "waterChange": 0, "healthChange": -10}
- "Goddess gave slave food" -> {"hungerChange": 25, "waterChange": 0, "healthChange": 5}
- "Goddess promoted slave to pet" -> {"hungerChange": 5, "waterChange": 5, "healthChange": 15}
- "Goddess demoted slave to dirt" -> {"hungerChange": -5, "waterChange": -5, "healthChange": -20}
- "Goddess stepped on slave's face" -> {"hungerChange": 0, "waterChange": 0, "healthChange": -8}
- "Goddess gave slave water" -> {"hungerChange": 0, "waterChange": 30, "healthChange": 3}
- "Goddess ignored slave" -> {"hungerChange": -3, "waterChange": -3, "healthChange": -5}

Return ONLY the JSON object, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { action, actionType } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
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

    // Build the prompt for the AI
    let prompt = '';
    if (actionType === 'rank-change') {
      prompt = `Rank change: ${action}`;
    } else {
      prompt = `Action: ${action}`;
    }

    // Call OpenAI API to determine stat changes
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: STAT_PROCESSOR_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Low temperature for more consistent results
      max_tokens: 100,
      response_format: { type: 'json_object' }, // Force JSON response
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    // Parse the JSON response
    let statChanges;
    try {
      statChanges = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Return default neutral changes if parsing fails
      statChanges = {
        hungerChange: 0,
        waterChange: 0,
        healthChange: 0,
      };
    }

    // Validate and sanitize the changes
    const hungerChange = Math.max(-30, Math.min(30, statChanges.hungerChange || 0));
    const waterChange = Math.max(-30, Math.min(30, statChanges.waterChange || 0));
    const healthChange = Math.max(-30, Math.min(30, statChanges.healthChange || 0));

    console.log(`📊 Stat changes for "${action}":`, {
      hungerChange,
      waterChange,
      healthChange,
    });

    return NextResponse.json({
      success: true,
      changes: {
        hungerChange,
        waterChange,
        healthChange,
      },
    });
  } catch (error: any) {
    console.error('AI stat processing error:', error);

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
      { error: 'Failed to process stat changes' },
      { status: 500 }
    );
  }
}
