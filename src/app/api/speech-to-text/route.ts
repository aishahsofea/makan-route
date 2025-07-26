import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const file = new File([buffer], "ausio.webm", { type: audioFile.type });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
      language: "en",
    });

    return NextResponse.json({
      text: transcription,
      success: true,
    });
  } catch (error) {
    console.error("Error in speech-to-text API:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
