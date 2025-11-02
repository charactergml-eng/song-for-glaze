import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'kingdom-rules.txt';

// Type for rules data
interface RulesData {
  rules: string;
  updatedAt: number;
}

// Get existing rules from blob
async function getRulesData(): Promise<RulesData | null> {
  try {
    // List all blobs and find our rules file
    const { blobs } = await list();
    const rulesBlob = blobs.find(blob => blob.pathname === BLOB_FILENAME);

    if (rulesBlob) {
      // Fetch the blob content
      const response = await fetch(rulesBlob.url);
      if (response.ok) {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          // If it's not JSON, treat it as plain text (backward compatibility)
          return {
            rules: text,
            updatedAt: Date.now()
          };
        }
      }
    }
  } catch (error) {
    console.log('No existing rules blob found:', error);
  }

  return null;
}

// GET: Read current rules
export async function GET() {
  try {
    const data = await getRulesData();
    return NextResponse.json(data || { rules: '', updatedAt: null });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reading rules:', errorMessage, error);
    return NextResponse.json(
      { error: `Failed to read rules: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST: Update rules
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rules } = body;

    if (!rules || typeof rules !== 'string') {
      return NextResponse.json(
        { error: 'Rules are required and must be a string' },
        { status: 400 }
      );
    }

    // Create new rules data
    const data: RulesData = {
      rules: rules.trim(),
      updatedAt: Date.now()
    };

    // Write to Vercel Blob as JSON
    await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error writing rules:', error);
    return NextResponse.json(
      { error: `Failed to save rules ${error}` },
      { status: 500 }
    );
  }
}
