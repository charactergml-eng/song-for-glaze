import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SlaveStatsModel, { ISlaveStats, MoodType } from '@/lib/models/SlaveStats';

// Passive decay rate (points per hour)
// At 0.1 per hour: 2.4 points per day, takes ~42 days to go from 100 to 0
const HUNGER_DECAY_RATE = 0.1; // points per hour
const WATER_DECAY_RATE = 0.1; // points per hour

// Helper function to apply passive decay based on time elapsed
function applyPassiveDecay(stats: any) {
  const now = Date.now();
  const lastUpdated = stats.lastUpdated || now;
  const hoursElapsed = (now - lastUpdated) / (1000 * 60 * 60); // Convert ms to hours

  if (hoursElapsed > 0) {
    // Apply decay to hunger and water
    const hungerDecay = HUNGER_DECAY_RATE * hoursElapsed;
    const waterDecay = WATER_DECAY_RATE * hoursElapsed;

    stats.hunger = Math.round(Math.max(0, stats.hunger - hungerDecay));
    stats.water = Math.round(Math.max(0, stats.water - waterDecay));

    // Health doesn't decay passively (only affected by actions)
  }

  return stats;
}

// GET: Retrieve current slave stats
export async function GET() {
  try {
    await connectToDatabase();

    // Get or create stats for the slave
    let stats = await SlaveStatsModel.findOne({ userId: 'slave' });

    if (!stats) {
      // Create initial stats if they don't exist
      stats = await SlaveStatsModel.create({
        userId: 'slave',
        hunger: 50,
        mood: 'happy',
        water: 50,
        health: 70,
        lastUpdated: Date.now(),
      });
    } else {
      // Apply passive decay based on time elapsed
      applyPassiveDecay(stats);

      // Save the updated stats with new timestamp
      await stats.save();
    }

    return NextResponse.json({
      success: true,
      stats: {
        hunger: stats.hunger,
        mood: stats.mood,
        water: stats.water,
        health: stats.health,
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// POST: Update slave stats
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { hunger, water, health } = body;

    // Get existing stats
    let stats = await SlaveStatsModel.findOne({ userId: 'slave' });

    if (!stats) {
      // Create if doesn't exist
      stats = new SlaveStatsModel({
        userId: 'slave',
        hunger: hunger ?? 50,
        water: water ?? 50,
        health: health ?? 70,
      });
    } else {
      // Apply passive decay before updating
      applyPassiveDecay(stats);

      // Update only provided fields
      if (hunger !== undefined) stats.hunger = Math.max(0, Math.min(100, hunger));
      if (water !== undefined) stats.water = Math.max(0, Math.min(100, water));
      if (health !== undefined) stats.health = Math.max(1, Math.min(100, health)); // health min is 1
    }

    await stats.save(); // Pre-save hook will auto-calculate mood

    return NextResponse.json({
      success: true,
      stats: {
        hunger: stats.hunger,
        mood: stats.mood,
        water: stats.water,
        health: stats.health,
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

// PATCH: Apply stat changes (deltas) - used by AI
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { hungerChange, waterChange, healthChange } = body;

    // Get existing stats
    let stats = await SlaveStatsModel.findOne({ userId: 'slave' });

    if (!stats) {
      // Create if doesn't exist
      stats = new SlaveStatsModel({
        userId: 'slave',
        hunger: 50,
        water: 50,
        health: 70,
      });
    } else {
      // Apply passive decay before applying new changes
      applyPassiveDecay(stats);
    }

    // Apply deltas
    if (hungerChange !== undefined) {
      stats.hunger = Math.max(0, Math.min(100, stats.hunger + hungerChange));
    }
    if (waterChange !== undefined) {
      stats.water = Math.max(0, Math.min(100, stats.water + waterChange));
    }
    if (healthChange !== undefined) {
      stats.health = Math.max(1, Math.min(100, stats.health + healthChange));
    }

    await stats.save(); // Pre-save hook will auto-calculate mood

    return NextResponse.json({
      success: true,
      stats: {
        hunger: stats.hunger,
        mood: stats.mood,
        water: stats.water,
        health: stats.health,
        lastUpdated: stats.lastUpdated,
      },
      changes: {
        hungerChange: hungerChange || 0,
        waterChange: waterChange || 0,
        healthChange: healthChange || 0,
      },
    });
  } catch (error) {
    console.error('Error applying stat changes:', error);
    return NextResponse.json(
      { error: 'Failed to apply stat changes' },
      { status: 500 }
    );
  }
}
