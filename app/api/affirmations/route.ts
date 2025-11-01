import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'affirmations.json';

// Type for affirmations data
interface AffirmationsData {
  player1_to_player2?: string;
  player2_to_player1?: string;
}

// Get existing data from blob or return empty object
async function getAffirmationsData(): Promise<AffirmationsData> {
  try {
    // List all blobs and find our affirmations file
    const { blobs } = await list();
    const affirmationsBlob = blobs.find(blob => blob.pathname === BLOB_FILENAME);

    if (affirmationsBlob) {
      // Fetch the blob content
      const response = await fetch(affirmationsBlob.url);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.log('No existing blob found, returning empty data:', error);
  }

  return {};
}

// GET: Read affirmations
export async function GET() {
  try {
    const data = await getAffirmationsData();
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

// POST: Write/update affirmation
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

    // Read existing data
    const data = await getAffirmationsData();

    // Update the appropriate field
    const key = player === 'player1' ? 'player1_to_player2' : 'player2_to_player1';
    data[key] = message;

    // Write to Vercel Blob
    await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error writing affirmation:', error);
    return NextResponse.json(
      { error: `Failed to save affirmation ${error}` },
      { status: 500 }
    );
  }
}
