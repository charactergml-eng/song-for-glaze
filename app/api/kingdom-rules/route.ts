import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import KingdomRuleModel from '@/lib/models/KingdomRule';
import { cookies } from 'next/headers';

// Type for rules data
interface RulesData {
  rules: string;
  updatedAt: number;
}

// Helper function to get user from session
async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return null;
    }

    const userData = JSON.parse(authToken.value);
    return userData;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

// GET: Read latest kingdom rules
export async function GET() {
  try {
    await connectToDatabase();

    // Get the most recent kingdom rule
    const latestRule = await KingdomRuleModel
      .findOne()
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    if (latestRule) {
      return NextResponse.json({
        rules: latestRule.rules,
        updatedAt: new Date(latestRule.createdAt).getTime()
      });
    }

    return NextResponse.json({ rules: '', updatedAt: null });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reading rules:', errorMessage, error);
    return NextResponse.json(
      { error: `Failed to read rules: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST: Create new kingdom rules entry
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is the Goddess
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    if (user.role !== 'Goddess') {
      return NextResponse.json(
        { error: 'Forbidden - Only the Goddess can edit Kingdom Rules' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rules } = body;

    if (!rules || typeof rules !== 'string') {
      return NextResponse.json(
        { error: 'Rules are required and must be a string' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create new kingdom rule in database
    const newRule = await KingdomRuleModel.create({
      rules: rules.trim(),
      createdAt: new Date()
    });

    const data: RulesData = {
      rules: newRule.rules,
      updatedAt: new Date(newRule.createdAt).getTime()
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error writing rules:', error);
    return NextResponse.json(
      { error: `Failed to save rules ${error}` },
      { status: 500 }
    );
  }
}
