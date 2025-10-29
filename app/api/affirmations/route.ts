import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'affirmations.json');

// Type for affirmations data
interface AffirmationsData {
  player1_to_player2?: string;
  player2_to_player1?: string;
}

// Ensure data directory and file exist
async function ensureDataFile(): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');

  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  try {
    await fs.access(DATA_FILE);
  } catch {
    // Create empty affirmations file
    await fs.writeFile(DATA_FILE, JSON.stringify({}, null, 2));
  }
}

// GET: Read affirmations
export async function GET() {
  try {
    await ensureDataFile();
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const data: AffirmationsData = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading affirmations:', error);
    return NextResponse.json(
      { error: 'Failed to read affirmations' },
      { status: 500 }
    );
  }
}

// POST: Write/update affirmation
export async function POST(request: NextRequest) {
  try {
    await ensureDataFile();

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
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const data: AffirmationsData = JSON.parse(fileContent);

    // Update the appropriate field
    const key = player === 'player1' ? 'player1_to_player2' : 'player2_to_player1';
    data[key] = message;

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error writing affirmation:', error);
    return NextResponse.json(
      { error: 'Failed to save affirmation' },
      { status: 500 }
    );
  }
}
