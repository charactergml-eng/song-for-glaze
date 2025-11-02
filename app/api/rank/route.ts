import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'player-rank.json';

// Type for rank data
interface RankData {
  rank: string;
  updatedAt: number;
}

// Get existing rank from blob or return default
async function getRankData(): Promise<RankData> {
  try {
    // List all blobs and find our rank file
    const { blobs } = await list();
    const rankBlob = blobs.find(blob => blob.pathname === BLOB_FILENAME);

    if (rankBlob) {
      // Fetch the blob content
      const response = await fetch(rankBlob.url);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.log('No existing rank blob found, returning default:', error);
  }

  // Default rank
  return {
    rank: 'slave',
    updatedAt: Date.now()
  };
}

// GET: Read current rank
export async function GET() {
  try {
    const data = await getRankData();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reading rank:', errorMessage, error);
    return NextResponse.json(
      { error: `Failed to read rank: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST: Update rank
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rank } = body;

    if (!rank || typeof rank !== 'string') {
      return NextResponse.json(
        { error: 'Rank is required and must be a string' },
        { status: 400 }
      );
    }

    // Create new rank data
    const data: RankData = {
      rank: rank.trim(),
      updatedAt: Date.now()
    };

    // Write to Vercel Blob
    await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error writing rank:', error);
    return NextResponse.json(
      { error: `Failed to save rank ${error}` },
      { status: 500 }
    );
  }
}
