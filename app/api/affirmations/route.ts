import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AffirmationModel from '@/lib/models/Affirmation';

// Type for affirmations data
interface AffirmationsData {
  player1_to_player2?: string;
  player2_to_player1?: string;
}

// GET: Read latest affirmations
export async function GET() {
  try {
    await connectToDatabase();

    // Get the latest affirmation from player1 to player2
    const player1ToPlayer2 = await AffirmationModel
      .findOne({ sender: 'player1', recipient: 'player2' })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    // Get the latest affirmation from player2 to player1
    const player2ToPlayer1 = await AffirmationModel
      .findOne({ sender: 'player2', recipient: 'player1' })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    const data: AffirmationsData = {};

    if (player1ToPlayer2) {
      data.player1_to_player2 = player1ToPlayer2.message;
    }

    if (player2ToPlayer1) {
      data.player2_to_player1 = player2ToPlayer1.message;
    }

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reading affirmations:', errorMessage, error);
    return NextResponse.json(
      { error: `Failed to read affirmations: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST: Create new affirmation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player, message } = body;

    if (!player || !message) {
      return NextResponse.json(
        { error: 'Player and message are required' },
        { status: 400 }
      );
    }

    // Validate player
    if (player !== 'player1' && player !== 'player2') {
      return NextResponse.json(
        { error: 'Invalid player. Must be player1 or player2' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Determine sender and recipient
    const sender = player;
    const recipient = player === 'player1' ? 'player2' : 'player1';

    // Create new affirmation in database
    const newAffirmation = await AffirmationModel.create({
      sender,
      recipient,
      message,
      createdAt: new Date()
    });

    // Get the latest affirmations to return
    const player1ToPlayer2 = await AffirmationModel
      .findOne({ sender: 'player1', recipient: 'player2' })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    const player2ToPlayer1 = await AffirmationModel
      .findOne({ sender: 'player2', recipient: 'player1' })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    const data: AffirmationsData = {};

    if (player1ToPlayer2) {
      data.player1_to_player2 = player1ToPlayer2.message;
    }

    if (player2ToPlayer1) {
      data.player2_to_player1 = player2ToPlayer1.message;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error writing affirmation:', error);
    return NextResponse.json(
      { error: `Failed to save affirmation ${error}` },
      { status: 500 }
    );
  }
}
