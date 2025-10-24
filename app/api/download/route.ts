import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    // Read the audio file from the public directory
    const filePath = join(process.cwd(), "public", "audio", "song.mp3");
    const fileBuffer = await readFile(filePath);

    // Return the file with download headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="song.mp3"',
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
